import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";

import { User } from "./models/user";
import { CurrentConditions } from "./models/station";

import { subscriptionStatus } from "./utils/subscriptionInfo";
import { updateUserDb } from "./utils/getConditions/updateUserDb";
import { updateApiKey } from "./utils/getConditions/updateApiKey";
import { retrieveApiKey } from "./utils/getConditions/retrieveApiKey";
import { getUrlsToFetch } from "./utils/getConditions/getUrlsToFetch";
import { updateStationsDb } from "./utils/getConditions/updateStationsDb";
import { fetchDbConditions } from "./utils/getConditions/fetchDbConditions";
import { fetchWuConditions } from "./utils/getConditions/fetchWuConditions";
import { filterStaticStations } from "./utils/getConditions/filterStaticStations";
import { buildCurrentConditions } from "./utils/getConditions/buildCurrentConditions";

interface ErrorApiResponse {
  metadata: {
    status_code: number;
  };
  error: {
    message: string;
  },
  success: string; // "false"
}

interface MetricProps {
  temp: number;
  heatIndex: number;
  dewpt: number;
  windChill: number;
  windSpeed: number;
  windGust: number;
  pressure: number;
  precipRate: number;
  precipTotal: number;
  elev: number;
}

interface CurrentConditionsResponse {
  stationID: string;
  obsTimeUtc: string;
  obsTimeLocal: string;
  neighborhood: string;
  softwareType: string;
  country: string;
  solarRadiation: number;
  lon: number;
  realtimeFrequency: null | number;
  epoch: number;
  lat: number;
  uv: number;
  winddir: number;
  humidity: number;
  qcStatus: number;
  metric: MetricProps;
}

// Documentation: https://bit.ly/3TIaMNP
export interface CurrentApiResponse {
  observations: CurrentConditionsResponse[];
}

interface GetCurrentConditionsProps {
  userId: string;
  stationsIds: string[];
}

export const getCurrentConditionsFunction = onCall(async (request) => {
  const { userId, stationsIds } = request.data as GetCurrentConditionsProps;

  const firestore = admin.firestore();
  const usersCol = firestore.collection("users");
  const currentConditionsCol = firestore.collection("currentConditions");

  const currentUnixTime = Date.now();

  // Fetch the user document from the database
  const userSnapshot = await usersCol.doc(userId).get();
  const user = userSnapshot.data() as User;

  const { subscription } = user;

  const maxStationsToFetch = subscriptionStatus[subscription].maxStations;

  // Get stations from DB
  const dbCurrentConditions = await fetchDbConditions<CurrentConditions>({
    collection: currentConditionsCol,
    stationsIds,
    maxStationsToFetch,
  });

  const { staticStations, stationsToFetch } = filterStaticStations<CurrentConditions>({
    dbConditions: dbCurrentConditions,
    currentUnixTime,
    user,
  });

  const numberOfRequests = stationsToFetch.length;

  // Verify how many api requests are needed and get an api key with enough available requests
  const apiKey = await retrieveApiKey({ currentUnixTime, numberOfRequests });

  // If there is no api key, return the current data from DB
  if (!apiKey) return { currentConditions: dbCurrentConditions };

  // Create an array with the urls to fetch data from Weather Underground (WU)
  const weatherDataFetchUrls = await getUrlsToFetch<CurrentConditions>({
    dbConditions: stationsToFetch,
    apiKey: apiKey.key,
    fetchType: "current",
  });

  // Fetch data from WU API, or return the current data from DB if the data is not outdated
  const { offlineStations, conditionsData } = await fetchWuConditions({ weatherDataFetchUrls });

  const currentConditionsArray = [] as CurrentConditions[];

  // Push new data with fetched current conditions
  conditionsData.forEach((data) => {
    if (data.status !== "fulfilled") return;

    const responseData = data.value?.responseData as ErrorApiResponse;

    if (!responseData) return;

    const dataFetchFailed = responseData.success === "false";

    if (dataFetchFailed) return;

    const value = data.value?.responseData as CurrentApiResponse;

    const station = buildCurrentConditions({
      currentConditions: value,
      lastFetchUnix: currentUnixTime,
    });

    currentConditionsArray.push(station);
  });

  await updateStationsDb<CurrentConditions>({ collection: currentConditionsCol, stations: currentConditionsArray });
  await updateUserDb({ userId, lastFetchUnix: currentUnixTime });
  await updateApiKey({ apiKey });

  return { currentConditions: [...currentConditionsArray, ...staticStations, ...offlineStations] };
});
