import { onCall } from "firebase-functions/v2/https";
import { users } from "./utils/collections";
import { auth } from ".";

interface UpdateProfileProps {
  userId: string;
  name?: string;
  email?: string;
  password?: string;
}

export const updateProfileFunction = onCall(async (request) => {
  const { userId, name, email, password } = request.data as UpdateProfileProps;

  const authUser = await auth.getUser(userId);

  const userRef = users.doc(userId);

  try {
    if (name) {
      await userRef.update({ name });
    }

    if (email) {
      await auth.updateUser(authUser.uid, { email });
      await userRef.update({ email });
    }

    if (password) {
      await auth.updateUser(authUser.uid, { password });
    }

    return { success: true };
  } catch (error) {
    const typedError = error as Error;
    console.error(`Error updating user ${userId}:`, error);

    return {
      error: typedError.message,
      success: false,
    };
  }
});
