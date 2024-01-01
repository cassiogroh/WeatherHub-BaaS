import { subDays } from "date-fns";

import { getApiKey } from "./utils/getApiKey";
import { getHistoricUrl } from "./utils/api_info";
import { historicConditions } from "./utils/collections";
import { HistoricConditions } from "./models/station";
import { PAGE_SIZE, MINUTES_TO_FETCH_NEW_DATA, historyConditionsMock } from "./utils/constans";

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

// Documentation: https://bit.ly/3TIaMNP
interface ApiResponse {
  summaries: HistoricConditionsResponse[];
}

interface WeatherDataFetchUrlsProps {
  station: HistoricConditions;
  fetchUrl: string;
  shouldFetchNewData: boolean;
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
  // Get user stations from DB
  const startAt = (currentPage - 1) * PAGE_SIZE;
  const userStationsSnapshot = await historicConditions.where("userId", "==", userId).orderBy("order").startAt(startAt).limit(PAGE_SIZE).get();

  const userHistoricConditions: HistoricConditions[] = userStationsSnapshot.docs.map(doc => {
    return {
      ...doc.data() as HistoricConditions,
    };
  });

  // Verify how many api requests are needed and get an api key with enough available requests
  const currentUnixTime = Date.now();
  const lastFetchUnixArray = userHistoricConditions.map((station) => station.lastFetchUnix);

  const apiKey = await getApiKey({ currentUnixTime, lastFetchUnixArray });

  // If no API key is available, return the current data from DB
  if (!apiKey) return { historicConditions: userHistoricConditions };

  // Create an array with the urls to fetch data from Weather Underground (WU)
  const weatherDataFetchUrls: WeatherDataFetchUrlsProps[] = [];
  userHistoricConditions.forEach((station) => {
    const minutesSinceLastFetch = (currentUnixTime - station.lastFetchUnix) / 1000 / 60;

    weatherDataFetchUrls.push({
      station,
      fetchUrl: getHistoricUrl(station.stationID, apiKey),
      shouldFetchNewData: minutesSinceLastFetch > MINUTES_TO_FETCH_NEW_DATA,
    });
  });

  const offlineStations: HistoricConditions[] = [];

  // Fetch data from WU API, or return the current data from DB if the data is not outdated
  const stationsHistoricData = await Promise.allSettled(
    weatherDataFetchUrls.map(async ({ station, fetchUrl, shouldFetchNewData }) => {
      try {
        if (shouldFetchNewData) {
          const response = await fetch(fetchUrl);
          const responseData = await response.json();
          return {
            newData: true,
            responseData,
            station,
          };
        }

        return {
          newData: false,
          responseData: null,
          station,
        };
      } catch (error) {
        console.error(error);
        offlineStations.push(station);
        return;
      }
    },
    ),
  );

  const historicConditionsArray: HistoricConditions[] = [];

  // Create an array with the current conditions
  stationsHistoricData.forEach((data) => {
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
    const seven_days_ago = subDays(new Date(), 6);

    const isObservationsLessThanSeven = observations.length < 7;
    const isObservationsFirstDayNotSevenDaysAgo = new Date(observations[0].obsTimeLocal).getDate() !== seven_days_ago.getDate();
    const isObservationsLastDayNotToday = new Date(observations[observations.length - 1].obsTimeLocal).getDate() !== new Date().getDate();

    if (isObservationsLessThanSeven) {
      for (let i = 0; i < observations.length - 1; i++) {
        const date1 = new Date(observations[i].obsTimeLocal).getDate();
        const date2 = new Date(observations[i + 1].obsTimeLocal).getDate();

        const isDateGapMoreThanOneDay = date2 > date1 + 1;

        if (isDateGapMoreThanOneDay) {
          indexToReplace.push(i+1);
        }
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
      station.conditions.push({
        tempHigh: formatValue(historicData.metric.tempHigh),
        tempLow: formatValue(historicData.metric.tempLow),
        tempAvg: formatValue(historicData.metric.tempAvg),
        windspeedHigh: formatValue(historicData.metric.windspeedHigh),
        windspeedLow: formatValue(historicData.metric.windspeedLow),
        windspeedAvg: formatValue(historicData.metric.windspeedAvg),
        windgustHigh: formatValue(historicData.metric.windgustHigh),
        windgustLow: formatValue(historicData.metric.windgustLow),
        windgustAvg: formatValue(historicData.metric.windgustAvg),
        dewptHigh: formatValue(historicData.metric.dewptHigh),
        dewptLow: formatValue(historicData.metric.dewptLow),
        dewptAvg: formatValue(historicData.metric.dewptAvg),
        windchillHigh: formatValue(historicData.metric.windchillHigh),
        windchillLow: formatValue(historicData.metric.windchillLow),
        windchillAvg: formatValue(historicData.metric.windchillAvg),
        heatindexHigh: formatValue(historicData.metric.heatindexHigh),
        heatindexLow: formatValue(historicData.metric.heatindexLow),
        heatindexAvg: formatValue(historicData.metric.heatindexAvg),
        pressureMax: formatValue(historicData.metric.pressureMax),
        pressureMin: formatValue(historicData.metric.pressureMin),
        precipTotal: formatValue(historicData.metric.precipTotal),
        precipRate: formatValue(historicData.metric.precipRate),
        pressureTrend: formatValue(historicData.metric.pressureTrend),
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

  return { historicConditions: historicConditionsArray };
};
