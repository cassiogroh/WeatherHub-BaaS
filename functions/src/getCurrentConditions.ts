
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
interface ApiResponse {
  observations: CurrentConditionsResponse[];
}

interface GetCurrentConditionsProps {
  userId: string;
  currentPage: number;
}

function formatValue(value: number | null): string {
  return value || value === 0 ? value.toFixed(1) : "--";
}

export const getCurrentConditionsFunction = onCall(async (request) => {
  const { userId, currentPage } = request.data as GetCurrentConditionsProps;

  const currentUnixTime = Date.now();

  // Fetch the user document from the database
  const userSnapshot = await users.doc(userId).get();
  const user = userSnapshot.data() as User;

  const { stationsIds, subscription } = user;

  const maxStationsToFetch = subscriptionStatus[subscription].maxStations;
  const userCanFetchNewData = await verifyUserSubscription({ user, currentUnixTime });

  // Get stations from DB
  const dbCurrentConditions = await fetchDbConditions<CurrentConditions>({
    collection: currentConditions,
    stationsIds,
    currentPage,
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
  const weatherDataFetchUrls = await getUrlsToFetch<CurrentConditions>({ dbConditions: dbCurrentConditions, currentUnixTime, apiKey });

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

    const station = data.value.station;

    // If the data is not outdated, return the current data from DB
    if (data.value.newData === false) {
      currentConditionsArray.push(station);
      return;
    }

    station.status = "online";
    const value = data.value.responseData as ApiResponse;

    station.lastFetchUnix = currentUnixTime;

    const observations = value.observations[0];
    const { metric } = observations;

    station.conditions = {
      dewPoint: formatValue(metric.dewpt),
      elevation: formatValue(metric.elev),
      heatIndex: formatValue(metric.heatIndex),
      precipRate: formatValue(metric.precipRate),
      precipTotal: formatValue(metric.precipTotal),
      pressure: formatValue(metric.pressure),
      temperature: formatValue(metric.temp),
      windChill: formatValue(metric.windChill),
      windGust: formatValue(metric.windGust),
      windSpeed: formatValue(metric.windSpeed),
      humidity: formatValue(observations.humidity),
      solarRadiation: formatValue(observations.solarRadiation),
      windDirection: formatValue(observations.winddir),
      uv: formatValue(observations.uv),
    };

    currentConditionsArray.push(station);
  });

  await updateStationsDb<CurrentConditions>({ collection: currentConditions, stations: currentConditionsArray });
  await updateUserDb({ userId, lastFetchUnix: currentUnixTime, lastFetchPage: currentPage });

  return { currentConditions: currentConditionsArray };
});
