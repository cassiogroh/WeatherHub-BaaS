
import { onCall } from "firebase-functions/v2/https";
import { CurrentConditions } from "./models/station";
import { currentConditions, users } from "./utils/collections";
import { retrieveApiKey } from "./utils/getConditions/retrieveApiKey";
import { getUrlsToFetch } from "./utils/getConditions/getUrlsToFetch";
import { fetchDbConditions } from "./utils/getConditions/fetchDbConditions";
import { fetchWuConditions } from "./utils/getConditions/fetchWuConditions";
import { verifyUserSubscription } from "./utils/getConditions/verifyUserSubscription";
import { updateStationsDb } from "./utils/getConditions/updateStationsDb";
import { updateUserDb } from "./utils/getConditions/updateUserDb";
import { User } from "./models/user";
import { subscriptionStatus } from "./utils/subscriptionInfo";
import { buildCurrentConditions } from "./utils/getConditions/buildCurrentConditions";

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

  const currentUnixTime = Date.now();

  // Fetch the user document from the database
  const userSnapshot = await users.doc(userId).get();
  const user = userSnapshot.data() as User;

  const { subscription } = user;

  const maxStationsToFetch = subscriptionStatus[subscription].maxStations;
  const { userCanFetchNewData } = await verifyUserSubscription({ user, currentUnixTime });

  // Get stations from DB
  const dbCurrentConditions = await fetchDbConditions<CurrentConditions>({
    collection: currentConditions,
    stationsIds,
    maxStationsToFetch,
  });

  // If the user can't fetch new data, return the current data from DB
  if (!userCanFetchNewData) return { currentConditions: dbCurrentConditions };

  const lastFetchUnixArray = dbCurrentConditions.map((station) => station.lastFetchUnix);

  // Verify how many api requests are needed and get an api key with enough available requests
  const apiKey = await retrieveApiKey({ currentUnixTime, lastFetchUnixArray });

  // If there is no api key, return the current data from DB
  if (!apiKey) return { currentConditions: dbCurrentConditions };

  // Create an array with the urls to fetch data from Weather Underground (WU)
  const weatherDataFetchUrls = await getUrlsToFetch<CurrentConditions>({
    dbConditions: dbCurrentConditions,
    currentUnixTime,
    apiKey,
    fetchType: "current",
  });

  // Fetch data from WU API, or return the current data from DB if the data is not outdated
  const { offlineStations, conditionsData } = await fetchWuConditions({ weatherDataFetchUrls });

  const currentConditionsArray: CurrentConditions[] = [];

  // Create an array with the current conditions
  conditionsData.forEach((data) => {
    if (data.status !== "fulfilled" || !data.value?.responseData) {
      const station = offlineStations.shift();
      if (!station) return;

      station.status = "offline";
      station.lastFetchUnix = currentUnixTime;
      currentConditionsArray.push(station);
      return;
    }

    let station = data.value.station;

    // If the data is not outdated, return the current data from DB
    if (data.value.newData === false) {
      currentConditionsArray.push(station);
      return;
    }

    const value = data.value.responseData as CurrentApiResponse;

    station = buildCurrentConditions({
      currentConditions: value,
      status: "online",
      lastFetchUnix: currentUnixTime,
    });

    currentConditionsArray.push(station);
  });

  await updateStationsDb<CurrentConditions>({ collection: currentConditions, stations: currentConditionsArray });
  await updateUserDb({ userId, lastFetchUnix: currentUnixTime });

  return { currentConditions: currentConditionsArray };
});
