import * as admin from "firebase-admin";
import { API_LIMIT } from "./constans";

interface APIKeyProps {
  key: string;
  currentUsage: number;
}

interface GetApiKeyProps {
  numberOfRequests: number;
}

export const getApiKey = async ({ numberOfRequests }: GetApiKeyProps) => {
  const firestore = admin.firestore();
  const wuApisCol = firestore.collection("wuApiKeys");

  const apiKeySnapshot = await wuApisCol
    .where("currentUsage", "<", API_LIMIT - numberOfRequests)
    .limit(1)
    .get();

  if (!apiKeySnapshot.empty) {
    const keyDocument = apiKeySnapshot.docs[0].data() as APIKeyProps;
    const apiKey = keyDocument.key;
    return apiKey;
  } else {
    return null;
  }
};
