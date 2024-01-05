import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const resetApiKeysUsageFunction = functions.pubsub.schedule("0 0 * * *").timeZone("UTC").onRun(async () => {
  const firestore = admin.firestore();
  const apiKeysCol = firestore.collection("wuApiKeys");

  const snapshot = await apiKeysCol.get();
  const batch = firestore.batch();

  snapshot.forEach((doc) => {
    const docRef = apiKeysCol.doc(doc.id);
    batch.update(docRef, { currentUsage: 0 });
  });
});
