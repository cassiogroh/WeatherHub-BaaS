/**
 * Finds (and optionally deletes) bot accounts: every account created on or after the cutoff date.
 *
 * Usage (from the functions folder):
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node scripts/deleteBotAccounts.js            # dry run, writes a CSV report
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node scripts/deleteBotAccounts.js --delete   # actually deletes
 *
 * Options:
 *   --since=2026-01-01T00:00:00Z   Cutoff date (default: start of 2026, UTC)
 *   --keep=a@b.com,uid123          Emails or uids to never delete (real users created after the cutoff)
 *   --delete                       Delete the accounts (Auth user + users/{uid} document)
 *
 * Accounts with a paid or admin subscription are always skipped.
 */
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, value] = arg.replace(/^--/, "").split("=");
  return [key, value ?? true];
}));

const since = new Date(args.since || "2026-01-01T00:00:00Z");
const keep = new Set(String(args.keep || "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean));
const shouldDelete = args.delete === true;

if (Number.isNaN(since.getTime())) {
  console.error(`Invalid --since date: ${args.since}`);
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.applicationDefault() });

const auth = admin.auth();
const usersCol = admin.firestore().collection("users");

const listAllAuthUsers = async () => {
  const users = [];
  let pageToken;

  do {
    const result = await auth.listUsers(1000, pageToken);
    users.push(...result.users);
    pageToken = result.pageToken;
  } while (pageToken);

  return users;
};

const chunk = (items, size) => {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
};

const csvValue = (value) => `"${String(value ?? "").replace(/"/g, "\"\"")}"`;

const main = async () => {
  console.log(`Looking for accounts created on or after ${since.toISOString()}${shouldDelete ? "" : " (dry run)"}`);

  const [authUsers, usersSnapshot] = await Promise.all([listAllAuthUsers(), usersCol.get()]);
  const firestoreUsers = new Map(usersSnapshot.docs.map((doc) => [doc.id, doc.data()]));
  const authUids = new Set(authUsers.map((authUser) => authUser.uid));

  const candidates = new Map();

  authUsers.forEach((authUser) => {
    if (new Date(authUser.metadata.creationTime) < since) return;

    candidates.set(authUser.uid, { uid: authUser.uid, authUser, profile: firestoreUsers.get(authUser.uid) });
  });

  // Profiles whose Auth user is already gone (or was created client side without one)
  firestoreUsers.forEach((profile, uid) => {
    if (authUids.has(uid) || !profile.created_at || profile.created_at < since.getTime()) return;

    candidates.set(uid, { uid, authUser: undefined, profile });
  });

  const toDelete = [];
  const skipped = [];

  candidates.forEach((candidate) => {
    const email = (candidate.authUser?.email || candidate.profile?.email || "").toLowerCase();
    const subscription = candidate.profile?.subscription || "free";

    if (keep.has(candidate.uid.toLowerCase()) || (email && keep.has(email))) {
      skipped.push({ ...candidate, reason: "in --keep list" });
    } else if (subscription !== "free") {
      skipped.push({ ...candidate, reason: `subscription: ${subscription}` });
    } else {
      toDelete.push(candidate);
    }
  });

  const reportPath = path.join(process.cwd(), `bot-accounts-${Date.now()}.csv`);
  const header = ["action", "uid", "email", "name", "createdAt", "lastSignIn", "emailVerified", "subscription", "stations", "hasAuthUser", "hasProfile"];
  const rows = [...toDelete.map((c) => ({ ...c, action: "delete" })), ...skipped.map((c) => ({ ...c, action: `skip (${c.reason})` }))]
    .map((c) => [
      c.action,
      c.uid,
      c.authUser?.email || c.profile?.email,
      c.profile?.name || c.authUser?.displayName,
      c.authUser?.metadata.creationTime || (c.profile?.created_at && new Date(c.profile.created_at).toISOString()),
      c.authUser?.metadata.lastSignInTime,
      c.authUser?.emailVerified,
      c.profile?.subscription,
      c.profile?.wuStations?.map((station) => station.id).join(" "),
      !!c.authUser,
      !!c.profile,
    ].map(csvValue).join(","));

  fs.writeFileSync(reportPath, [header.join(","), ...rows].join("\n"));

  console.log(`Total accounts: ${authUsers.length} auth users, ${firestoreUsers.size} profiles`);
  console.log(`Bot candidates: ${toDelete.length} to delete, ${skipped.length} skipped`);
  console.log(`Report written to ${reportPath}`);

  if (!shouldDelete) {
    console.log("Dry run only. Review the report, then re-run with --delete.");
    return;
  }

  // Auth: deleteUsers accepts at most 1000 uids per call
  const authUidsToDelete = toDelete.filter((c) => c.authUser).map((c) => c.uid);
  let authDeleted = 0;

  for (const uids of chunk(authUidsToDelete, 1000)) {
    const result = await auth.deleteUsers(uids);
    authDeleted += result.successCount;
    result.errors.forEach((error) => console.error(`Failed to delete auth user ${uids[error.index]}:`, error.error.message));
  }

  // Firestore: batches hold at most 500 writes
  const profileUids = toDelete.filter((c) => c.profile).map((c) => c.uid);

  for (const uids of chunk(profileUids, 500)) {
    const batch = admin.firestore().batch();
    uids.forEach((uid) => batch.delete(usersCol.doc(uid)));
    await batch.commit();
  }

  console.log(`Deleted ${authDeleted}/${authUidsToDelete.length} auth users and ${profileUids.length} profiles`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
