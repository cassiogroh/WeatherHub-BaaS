
import { onCall } from "firebase-functions/v2/https";
import { updateEmail, updatePassword, getAuth } from "firebase/auth";
import { firestore } from ".";

interface Request {
  userId: string;
  name: string;
  email: string;
  password?: string;
}

export const updateProfileFunction = onCall(async (request) => {
  const { userId, name, email, password } = request.data as Request;

  const auth = getAuth();

  const authUser = auth.currentUser;

  if (!authUser) return { error: "User not found" };
  
  try {
    if (name) {
      await firestore
        .collection('users')
        .doc(userId)
        .update({ name });
    }

    if (email) {
      await updateEmail(authUser, email);
    }
    if (password) {
      await updatePassword(authUser, password);
    }

    return { success: true };
  } catch (error) {
    const typedError = error as Error;
    console.error(`Error updating user ${userId}:`, error);

    return { error: typedError.message };
  }
});
