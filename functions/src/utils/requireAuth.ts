import { CallableRequest, HttpsError } from "firebase-functions/v2/https";

// Returns the uid of the signed in caller. Never trust a userId sent in request.data.
export const requireAuth = (request: CallableRequest): string => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be signed in");
  }

  return request.auth.uid;
};
