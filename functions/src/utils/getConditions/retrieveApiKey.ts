import { subscriptionStatus } from "../subscriptionInfo";
import { getApiKey } from "../getApiKey";

export interface RetrieveApiKeyProps {
  currentUnixTime: number;
  lastFetchUnixArray: number[];
}

export const retrieveApiKey = async ({ currentUnixTime, lastFetchUnixArray }: RetrieveApiKeyProps) => {
  // Verify how many api requests are needed and get an api key with enough available requests
  let numberOfRequests = 0;

  const minimumFetchTimeout = subscriptionStatus.tierThree.fetchTimeoutInMin;

  lastFetchUnixArray.forEach((lastFetchUnix) => {
    const minutesSinceLastFetch = (currentUnixTime - lastFetchUnix) / 1000 / 60;
    numberOfRequests += minutesSinceLastFetch > minimumFetchTimeout ? 1 : 0;
  });

  if (!numberOfRequests) return null;

  const apiKey = await getApiKey({ numberOfRequests });

  if (apiKey) {
    apiKey.currentUsage += numberOfRequests;
    apiKey.lastUsedAt = currentUnixTime;
  }

  return apiKey;
};
