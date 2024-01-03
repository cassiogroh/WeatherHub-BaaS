import { users } from "../collections";

interface UpdateUserDbProps {
  userId: string;
  lastFetchUnix: number;
  lastFetchPage: number;
}

export const updateUserDb = async ({ userId, lastFetchUnix, lastFetchPage }: UpdateUserDbProps) => {
  const userDocRef = users.doc(userId);

  await userDocRef.update({
    lastFetchUnix,
    lastFetchPage,
  });
};
