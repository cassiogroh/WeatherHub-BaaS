import { getFirestore } from "firebase-admin/firestore";
import { APIKey } from "../../models/apiKey";

interface UpdateApiKeyProps {
  apiKey: APIKey;
}

export const updateApiKey = async ({ apiKey }: UpdateApiKeyProps) => {
  const firestore = getFirestore();
  const apiKeyCol = firestore.collection("wuApiKeys");

  await apiKeyCol.doc(apiKey.id).update({
    lastUsedAt: apiKey.lastUsedAt,
    currentUsage: apiKey.currentUsage,
  });
};
