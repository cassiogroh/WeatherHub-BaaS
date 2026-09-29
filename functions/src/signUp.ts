import * as admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

import { SubscriptionStatus, User } from "./models/user";
import { isDisposableEmail } from "./utils/disposableEmailDomains";

// Set with: firebase functions:secrets:set TURNSTILE_SECRET_KEY
const turnstileSecretKey = defineSecret("TURNSTILE_SECRET_KEY");

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SignUpProps {
  name: string;
  email: string;
  password: string;
  captchaToken: string;
  website?: string; // honeypot, must be empty
}

interface TurnstileResponse {
  success: boolean;
  "error-codes": string[];
}

const verifyCaptcha = async (token: string, remoteIp?: string) => {
  const body = new URLSearchParams({
    secret: turnstileSecretKey.value(),
    response: token,
  });

  if (remoteIp) body.append("remoteip", remoteIp);

  const response = await fetch(TURNSTILE_VERIFY_URL, { method: "POST", body });
  const result = await response.json() as TurnstileResponse;

  if (!result.success) {
    console.warn("Captcha verification failed:", result["error-codes"]);
  }

  return result.success;
};

export const signUpFunction = onCall({ secrets: [turnstileSecretKey] }, async (request) => {
  const { name, email, password, captchaToken, website } = request.data as SignUpProps;

  // Hidden field only bots fill in. Pretend it worked so they don't adapt.
  if (website) {
    console.warn("Honeypot triggered for sign up:", email);
    return { success: true };
  }

  if (
    typeof name !== "string" || !name.trim() || name.length > 100 ||
    typeof email !== "string" || !EMAIL_REGEX.test(email) ||
    typeof password !== "string" || password.length < 6
  ) {
    throw new HttpsError("invalid-argument", "Invalid sign up data");
  }

  if (typeof captchaToken !== "string" || !captchaToken) {
    throw new HttpsError("failed-precondition", "Captcha token is missing");
  }

  const captchaIsValid = await verifyCaptcha(captchaToken, request.rawRequest.ip);

  if (!captchaIsValid) {
    throw new HttpsError("permission-denied", "Captcha verification failed");
  }

  if (isDisposableEmail(email)) {
    throw new HttpsError("invalid-argument", "Disposable email addresses are not allowed");
  }

  const firestore = admin.firestore();
  const auth = admin.auth();
  const usersCol = firestore.collection("users");

  let authUser: admin.auth.UserRecord;

  try {
    authUser = await auth.createUser({ email, password, displayName: name.trim() });
  } catch (error) {
    const typedError = error as { code?: string };

    if (typedError.code === "auth/email-already-exists") {
      throw new HttpsError("already-exists", "Email already registered");
    }

    console.error("Error creating user:", error);
    throw new HttpsError("internal", "Error creating user");
  }

  const now = Date.now();

  const newUser: User = {
    userId: authUser.uid,
    name: name.trim(),
    email,
    wuStations: [{
      id: "ISANTACA85",
      name: "Brusque - Centro",
      order: 0,
      createdAt: now,
    }],
    created_at: now,
    subscription: SubscriptionStatus.free,
    lastDataFetchUnix: now,
  };

  await usersCol.doc(newUser.userId).set(newUser);

  return { success: true };
});
