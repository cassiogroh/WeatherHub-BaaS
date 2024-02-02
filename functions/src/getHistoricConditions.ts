import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";

import { User } from "./models/user";
import { HistoricConditions } from "./models/station";

import { subscriptionStatus } from "./utils/subscriptionInfo";
import { updateUserDb } from "./utils/getConditions/updateUserDb";
import { updateApiKey } from "./utils/getConditions/updateApiKey";
import { retrieveApiKey } from "./utils/getConditions/retrieveApiKey";
import { getUrlsToFetch } from "./utils/getConditions/getUrlsToFetch";
import { updateStationsDb } from "./utils/getConditions/updateStationsDb";
import { fetchDbConditions } from "./utils/getConditions/fetchDbConditions";
import { fetchWuConditions } from "./utils/getConditions/fetchWuConditions";
import { filterStaticStations } from "./utils/getConditions/filterStaticStations";
import { buildHistoricConditions } from "./utils/getConditions/buildHistoricConditions";

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
  tempHigh: number | null;
  tempLow: number | null;
  tempAvg: number | null;
  windspeedHigh: number | null;
  windspeedLow: number | null;
  windspeedAvg: number | null;
  windgustHigh: number | null;
  windgustLow: number | null;
  windgustAvg: number | null;
  dewptHigh: number | null;
  dewptLow: number | null;
  dewptAvg: number | null;
  windchillHigh: number | null;
  windchillLow: number | null;
  windchillAvg: number | null;
  heatindexHigh: number | null;
  heatindexLow: number | null;
  heatindexAvg: number | null;
  pressureMax: number | null;
  pressureMin: number | null;
  pressureTrend: number | null;
  precipRate: number | null;
  precipTotal: number | null;
}

interface HistoricConditionsResponse {
  stationID: string;
  tz: string;
  obsTimeUtc: string;
  obsTimeLocal: string;
  epoch: number | null;
  lat: number;
  lon: number;
  solarRadiationHigh: number | null;
  uvHigh: number | null;
  winddirAvg: number | null;
  humidityHigh: number | null;
  humidityLow: number | null;
  humidityAvg: number | null;
  metric: MetricProps;
}

// Documentation: https://bit.ly/3U1SVSr
export interface HistoricApiResponse {
  summaries: HistoricConditionsResponse[];
}

interface GetHistoricConditionsProps {
  userId: string;
  stationsIds: string[];
}

export const getHistoricConditionsFunction = onCall(async (request) => {
  const { userId, stationsIds } = request.data as GetHistoricConditionsProps;

  const firestore = admin.firestore();
  const usersCol = firestore.collection("users");
  const historicConditionsCol = firestore.collection("historicConditions");

  const currentUnixTime = Date.now();

  // Fetch the user document from the database
  const userSnapshot = await usersCol.doc(userId).get();
  const user = userSnapshot.data() as User;

  const { subscription } = user;

  const maxStationsToFetch = subscriptionStatus[subscription].maxStations;

  // Get stations from DB
  const dbHistoricConditions = await fetchDbConditions<HistoricConditions>({
    collection: historicConditionsCol,
    stationsIds,
    maxStationsToFetch,
  });

  const { staticStations, stationsToFetch } = filterStaticStations<HistoricConditions>({
    dbConditions: dbHistoricConditions,
    currentUnixTime,
    user,
  });

  const numberOfRequests = stationsToFetch.length;

  // Verify how many api requests are needed and get an api key with enough available requests
  const apiKey = await retrieveApiKey({ currentUnixTime, numberOfRequests });

  // If there is no api key, return the current data from DB
  if (!apiKey) return { historicConditions: dbHistoricConditions };

  // Create an array with the urls to fetch data from Weather Underground (WU)
  const weatherDataFetchUrls = await getUrlsToFetch<HistoricConditions>({
    dbConditions: dbHistoricConditions,
    apiKey: apiKey.key,
    fetchType: "historic",
  });

  // Fetch data from WU API, or return the current data from DB if the data is not outdated
  const { offlineStations, conditionsData } = await fetchWuConditions({ weatherDataFetchUrls });

  const historicConditionsArray = [] as HistoricConditions[];

  // Push new data with fetched historic conditions
  conditionsData.forEach((data) => {
    if (data.status !== "fulfilled") return;

    const responseData = data.value?.responseData as ErrorApiResponse;

    if (!responseData) return;

    const dataFetchFailed = responseData.success === "false";

    if (dataFetchFailed) return;

    const value = data.value?.responseData as HistoricApiResponse;

    const station = buildHistoricConditions({
      historicConditions: value,
      lastFetchUnix: currentUnixTime,
    });

    historicConditionsArray.push(station);
  });

  await updateStationsDb<HistoricConditions>({ collection: historicConditionsCol, stations: historicConditionsArray });
  await updateUserDb({ userId, lastFetchUnix: currentUnixTime });
  await updateApiKey({ apiKey });

  return { historicConditions: [...historicConditionsArray, ...staticStations, ...offlineStations] };
});
