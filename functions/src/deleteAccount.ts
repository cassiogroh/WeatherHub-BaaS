import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { onCall } from "firebase-functions/v2/https";
import { requireAuth } from "./utils/requireAuth";

export const deleteAccountFunction = onCall(async (request) => {
  const userId = requireAuth(request);

  const firestore = getFirestore();
  const auth = getAuth();
  const usersCol = firestore.collection("users");

  await usersCol.doc(userId).delete();
  await auth.deleteUser(userId);
});
