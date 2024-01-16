import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";

interface DeleteAccountProps {
  userId: string;
}

export const deleteAccountFunction = onCall(async (request) => {
  const { userId } = request.data as DeleteAccountProps;

  const firestore = admin.firestore();
  const auth = admin.auth();
  const usersCol = firestore.collection("users");

  usersCol.doc(userId).delete();
  auth.deleteUser(userId);
});
