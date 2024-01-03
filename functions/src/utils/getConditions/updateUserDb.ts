import { users } from "../collections";

interface UpdateUserDbProps {
  userId: string;
  lastFetchUnix: number;
}

export const updateUserDb = async ({ userId, lastFetchUnix }: UpdateUserDbProps) => {
  const userDocRef = users.doc(userId);
  await userDocRef.update({ lastFetchUnix });
};
