import * as admin from "firebase-admin";

interface UpdateUserDbProps {
  userId: string;
  lastFetchUnix: number;
}

export const updateUserDb = async ({ userId, lastFetchUnix }: UpdateUserDbProps) => {
  const firestore = admin.firestore();
  const usersCol = firestore.collection("users");

  const userDocRef = usersCol.doc(userId);
  await userDocRef.update({ lastFetchUnix });
};
