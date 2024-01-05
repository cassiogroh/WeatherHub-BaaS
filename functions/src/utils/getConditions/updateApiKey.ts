import * as admin from "firebase-admin";
import { APIKey } from "../../models/apiKey";

interface UpdateApiKeyProps {
  apiKey: APIKey;
}

export const updateApiKey = async ({ apiKey }: UpdateApiKeyProps) => {
  const firestore = admin.firestore();
  const apiKeyCol = firestore.collection("weApiKeys");

  await apiKeyCol.doc(apiKey.id).update({
    lastUsedAt: apiKey.lastUsedAt,
    currentUsage: apiKey.currentUsage,
  });
};
