import { onCall } from "firebase-functions/v2/https";

import { HistoricConditions } from "./models/station";
import { historicConditions, users } from "./utils/collections";
import { retrieveApiKey } from "./utils/getConditions/retrieveApiKey";
import { getUrlsToFetch } from "./utils/getConditions/getUrlsToFetch";
import { fetchDbConditions } from "./utils/getConditions/fetchDbConditions";
import { fetchWuConditions } from "./utils/getConditions/fetchWuConditions";
import { verifyUserSubscription } from "./utils/getConditions/verifyUserSubscription";
import { updateStationsDb } from "./utils/getConditions/updateStationsDb";
import { updateUserDb } from "./utils/getConditions/updateUserDb";
import { User } from "./models/user";
import { subscriptionStatus } from "./utils/subscriptionInfo";
import { buildHistoricConditions } from "./utils/getConditions/buildHistoricConditions";

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

  const currentUnixTime = Date.now();

  // Fetch the user document from the database
  const userSnapshot = await users.doc(userId).get();
  const user = userSnapshot.data() as User;

  const { subscription } = user;

  const maxStationsToFetch = subscriptionStatus[subscription].maxStations;
  const { userCanFetchNewData } = await verifyUserSubscription({ user, currentUnixTime });

  // Get stations from DB
  const dbHistoricConditions = await fetchDbConditions<HistoricConditions>({
    collection: historicConditions,
    stationsIds,
    maxStationsToFetch,
  });

  // If the user can't fetch new data, return the current data from DB
  if (!userCanFetchNewData) return { historicConditions: dbHistoricConditions };

  const lastFetchUnixArray = dbHistoricConditions.map((station) => station.lastFetchUnix);

  // Verify how many api requests are needed and get an api key with enough available requests
  const apiKey = await retrieveApiKey({ currentUnixTime, lastFetchUnixArray });

  // If there is no api key, return the current data from DB
  if (!apiKey) return { historicConditions: dbHistoricConditions };

  // Create an array with the urls to fetch data from Weather Underground (WU)
  const weatherDataFetchUrls = await getUrlsToFetch<HistoricConditions>({
    dbConditions: dbHistoricConditions,
    currentUnixTime,
    apiKey,
    fetchType: "historic",
  });

  // Fetch data from WU API, or return the current data from DB if the data is not outdated
  const { offlineStations, conditionsData } = await fetchWuConditions({ weatherDataFetchUrls });

  const historicConditionsArray: HistoricConditions[] = [];

  // Create an array with the current conditions
  conditionsData.forEach((data) => {
    if (data.status !== "fulfilled" || !data.value?.responseData) {
      const station = offlineStations.shift();
      if (!station) return;

      station.status = "offline";
      station.lastFetchUnix = currentUnixTime;
      historicConditionsArray.push(station);
      return;
    }

    let station = data.value.station;

    // If the data is not outdated, return the current data from DB
    if (data.value.newData === false) {
      historicConditionsArray.push(station);
      return;
    }

    const value = data.value.responseData as HistoricApiResponse;

    station = buildHistoricConditions({
      historicConditions: value,
      lastFetchUnix: currentUnixTime,
      status: "online",
    });

    historicConditionsArray.push(station);
  });

  await updateStationsDb<HistoricConditions>({ collection: historicConditions, stations: historicConditionsArray });
  await updateUserDb({ userId, lastFetchUnix: currentUnixTime });

  return { historicConditions: historicConditionsArray };
});
