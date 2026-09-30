import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { requireAuth } from "./utils/requireAuth";
import { parseText } from "./utils/validation";

interface UpdateProfileProps {
  name?: string;
  email?: string;
  password?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Changing email or password requires having signed in in the last minutes,
// so a leaked/stolen session token alone can't take over the account.
// The Profile page signs in again with the current password right before calling this.
const RECENT_LOGIN_SECONDS = 5 * 60;

export const updateProfileFunction = onCall(async (request) => {
  const userId = requireAuth(request);
  const data = request.data as UpdateProfileProps;
  const token = request.auth?.token;

  const name = data?.name !== undefined ? parseText(data.name, "name", 100) : undefined;
  const email = data?.email !== undefined ? parseText(data.email, "email", 254).toLowerCase() : undefined;
  const password = data?.password;

  if (email !== undefined && !EMAIL_REGEX.test(email)) {
    throw new HttpsError("invalid-argument", "Invalid email");
  }

  if (password !== undefined && (typeof password !== "string" || password.length < 6 || password.length > 128)) {
    throw new HttpsError("invalid-argument", "Invalid password");
  }

  const emailChanged = email !== undefined && email !== token?.email?.toLowerCase();
  const signedInRecently = !!token?.auth_time && Date.now() / 1000 - token.auth_time < RECENT_LOGIN_SECONDS;

  if ((emailChanged || password !== undefined) && !signedInRecently) {
    throw new HttpsError("failed-precondition", "Recent login required to change email or password");
  }

  const auth = getAuth();
  const userRef = getFirestore().collection("users").doc(userId);

  try {
    if (name) {
      await userRef.update({ name });
    }

    if (emailChanged) {
      await auth.updateUser(userId, { email });
      await userRef.update({ email });
    }

    if (password !== undefined) {
      await auth.updateUser(userId, { password });
    }

    return { success: true };
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);

    const code = (error as { code?: string }).code;

    if (code === "auth/email-already-exists") {
      throw new HttpsError("already-exists", "Email already registered");
    }

    throw new HttpsError("internal", "Error updating profile");
  }
});
