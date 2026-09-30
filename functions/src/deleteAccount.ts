import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";
import { requireAuth } from "./utils/requireAuth";

export const deleteAccountFunction = onCall(async (request) => {
  const userId = requireAuth(request);

  const firestore = admin.firestore();
  const auth = admin.auth();
  const usersCol = firestore.collection("users");

  await usersCol.doc(userId).delete();
  await auth.deleteUser(userId);
});
