import { subDays } from "date-fns";

import { HistoricConditions } from "./models/station";
import { historicConditions, users } from "./utils/collections";
import { historyConditionsMock } from "./utils/constans";
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
  lat: number | null;
  lon: number | null;
  solarRadiationHigh: number | null;
  uvHigh: number | null;
  winddirAvg: number | null;
  humidityHigh: number | null;
  humidityLow: number | null;
  humidityAvg: number | null;
  metric: MetricProps;
}

// Documentation: https://bit.ly/3U1SVSr
interface ApiResponse {
  summaries: HistoricConditionsResponse[];
}

interface GetHistoricConditionsProps {
  userId: string;
  currentPage: number;
}

function formatValue(value: number | null): string {
  return value || value === 0 ? value.toFixed(1) : "--";
}

export const getHistoricConditionsFunction = async ({
  userId,
  currentPage,
}: GetHistoricConditionsProps,
) => {
  const currentUnixTime = Date.now();

  // Fetch the user document from the database
  const userSnapshot = await users.doc(userId).get();
  const user = userSnapshot.data() as User;

  const { stationsIds, subscription } = user;

  const maxStationsToFetch = subscriptionStatus[subscription].maxStations;
  const userCanFetchNewData = await verifyUserSubscription({ user, currentUnixTime });

  // Get stations from DB
  const dbHistoricConditions = await fetchDbConditions<HistoricConditions>({
    collection: historicConditions,
    stationsIds,
    currentPage,
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
  const weatherDataFetchUrls = await getUrlsToFetch<HistoricConditions>({ dbConditions: dbHistoricConditions, currentUnixTime, apiKey });

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

    const station = data.value.station;

    // If the data is not outdated, return the current data from DB
    if (data.value.newData === false) {
      historicConditionsArray.push(station);
      return;
    }

    station.status = "online";
    station.lastFetchUnix = currentUnixTime;
    const value = data.value.responseData as ApiResponse;
    const observations = value.summaries;

    // Seven days of observations are expected, but if the station had been
    // offline for more than one day, the API will return less than seven days
    // of observations, so we need to fill the gaps with mock data (null).
    const indexToReplace: number[] = [];
    const sevenDaysAgo = subDays(new Date(), 6);

    const isObservationsLessThanSeven = observations.length < 7;
    const isObservationsFirstDayNotSevenDaysAgo = new Date(observations[0].obsTimeLocal).getDate() !== sevenDaysAgo.getDate();
    const isObservationsLastDayNotToday = new Date(observations[observations.length - 1].obsTimeLocal).getDate() !== new Date().getDate();

    if (isObservationsLessThanSeven) {
      // Iterate over the observations array, excluding the last element
      for (let i = 0; i < observations.length - 1; i++) {
        // Get the date (day of the month) of the current observation
        const date1 = new Date(observations[i].obsTimeLocal).getDate();
        // Get the date (day of the month) of the next observation
        const date2 = new Date(observations[i + 1].obsTimeLocal).getDate();

        // Check if the gap between the current observation date and the next observation date is more than one day
        const isDateGapMoreThanOneDay = date2 > date1 + 1;

        // If the date gap is more than one day, add the index of the next observation to the indexToReplace array
        if (isDateGapMoreThanOneDay) indexToReplace.push(i+1);
      }
    }

    if (isObservationsFirstDayNotSevenDaysAgo) indexToReplace.push(0);
    if (isObservationsLastDayNotToday) indexToReplace.push(7);

    const isIndexToReplaceNotEmpty = indexToReplace.length > 0;

    if (isIndexToReplaceNotEmpty) {
      indexToReplace.forEach(index => {
        observations.splice(index, 0, historyConditionsMock);
      });
    }

    // Populate the station with the last seven days of observations
    observations.forEach((historicData) => {
      const { metric } = historicData;

      station.conditions.push({
        tempHigh: formatValue(metric.tempHigh),
        tempLow: formatValue(metric.tempLow),
        tempAvg: formatValue(metric.tempAvg),
        windspeedHigh: formatValue(metric.windspeedHigh),
        windspeedLow: formatValue(metric.windspeedLow),
        windspeedAvg: formatValue(metric.windspeedAvg),
        windgustHigh: formatValue(metric.windgustHigh),
        windgustLow: formatValue(metric.windgustLow),
        windgustAvg: formatValue(metric.windgustAvg),
        dewptHigh: formatValue(metric.dewptHigh),
        dewptLow: formatValue(metric.dewptLow),
        dewptAvg: formatValue(metric.dewptAvg),
        windchillHigh: formatValue(metric.windchillHigh),
        windchillLow: formatValue(metric.windchillLow),
        windchillAvg: formatValue(metric.windchillAvg),
        heatindexHigh: formatValue(metric.heatindexHigh),
        heatindexLow: formatValue(metric.heatindexLow),
        heatindexAvg: formatValue(metric.heatindexAvg),
        pressureMax: formatValue(metric.pressureMax),
        pressureMin: formatValue(metric.pressureMin),
        precipTotal: formatValue(metric.precipTotal),
        precipRate: formatValue(metric.precipRate),
        pressureTrend: formatValue(metric.pressureTrend),
        humidityLow: formatValue(historicData.humidityLow),
        humidityAvg: formatValue(historicData.humidityAvg),
        humidityHigh: formatValue(historicData.humidityHigh),
        uvHigh: formatValue(historicData.uvHigh),
        winddirAvg: formatValue(historicData.winddirAvg),
        solarRadiationHigh: formatValue(historicData.solarRadiationHigh),
      });
    });

    historicConditionsArray.push(station);
  });

  await updateStationsDb<HistoricConditions>({ collection: historicConditions, stations: historicConditionsArray });
  await updateUserDb({ userId, lastFetchUnix: currentUnixTime, lastFetchPage: currentPage });

  return { historicConditions: historicConditionsArray };
};
