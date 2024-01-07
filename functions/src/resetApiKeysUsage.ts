import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

export const resetApiKeysUsageFunction = onSchedule({
  schedule: "every day 00:00",
  timeZone: "Europe/London",
}, async () => {
  const firestore = admin.firestore();
  const apiKeysCol = firestore.collection("wuApiKeys");

  const snapshot = await apiKeysCol.get();
  const batch = firestore.batch();

  snapshot.forEach((doc) => {
    const docRef = apiKeysCol.doc(doc.id);
    batch.update(docRef, { currentUsage: 0 });
  });

  batch.commit();
});
