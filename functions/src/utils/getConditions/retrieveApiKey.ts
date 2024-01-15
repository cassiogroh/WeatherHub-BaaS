import { getApiKey } from "../getApiKey";

export interface RetrieveApiKeyProps {
  currentUnixTime: number;
  numberOfRequests: number;
}

export const retrieveApiKey = async ({ currentUnixTime, numberOfRequests }: RetrieveApiKeyProps) => {
  if (!numberOfRequests) return null;

  const apiKey = await getApiKey({ numberOfRequests });

  if (apiKey) {
    apiKey.currentUsage += numberOfRequests;
    apiKey.lastUsedAt = currentUnixTime;
  }

  return apiKey;
};
