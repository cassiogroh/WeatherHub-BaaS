import * as admin from "firebase-admin";
import { API_LIMIT } from "./constans";
import { APIKey } from "../models/apiKey";

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

  if (apiKeySnapshot.empty) return null;

  const document = apiKeySnapshot.docs[0];

  const apiKey = document.data() as APIKey;
  apiKey.id = document.id;

  return apiKey;
};
