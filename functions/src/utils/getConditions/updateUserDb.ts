import { getFirestore } from "firebase-admin/firestore";

interface UpdateUserDbProps {
  userId: string;
  lastFetchUnix: number;
}

export const updateUserDb = async ({ userId, lastFetchUnix }: UpdateUserDbProps) => {
  const firestore = getFirestore();
  const usersCol = firestore.collection("users");

  const userDocRef = usersCol.doc(userId);
  await userDocRef.update({ lastDataFetchUnix: lastFetchUnix });
};
