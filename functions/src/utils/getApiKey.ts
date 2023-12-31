import { wuApiKeys } from "./collections";
import { API_LIMIT, MINUTES_TO_FETCH_NEW_DATA } from "./constans";

interface APIKeyProps {
  key: string;
  currentUsage: number;
}

interface GetApiKeyProps {
  currentUnixTime: number;
  lastFetchUnixArray: number[];
}

export const getApiKey = async ({
  currentUnixTime,
  lastFetchUnixArray,
}: GetApiKeyProps) => {
  let numberOfRequests = 0;

  lastFetchUnixArray.forEach((lastFetchUnix) => {
    const minutesSinceLastFetch = (currentUnixTime - lastFetchUnix) / 1000 / 60;
    numberOfRequests += minutesSinceLastFetch > MINUTES_TO_FETCH_NEW_DATA ? 1 : 0;
  });

  const apiKeySnapshot = await wuApiKeys
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
