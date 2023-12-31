import { CurrentConditions } from "./models/station";
import { getCurrentConditionsUrl } from "./utils/api_info";
import { currentConditions } from "./utils/collections";
import { PAGE_SIZE, MINUTES_TO_FETCH_NEW_DATA } from "./utils/constans";
import { getApiKey } from "./utils/getApiKey";

interface MetricProps {
  temp: number;
  heatIndex: number;
  dewpt: number;
  windChill: number;
  windSpeed: number;
  windGust: null | number;
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

interface WeatherDataFetchUrlsProps {
  station: CurrentConditions;
  urlCurrent: string;
  shouldFetchNewData: boolean;
}

interface GetUserCurrentConditionsProps {
  userId: string;
  currentPage: number;
}

function formatValue(value: number | null | undefined): string {
  return value || value === 0 ? value.toFixed(1) : "--";
}

export const getUserCurrentConditionsFunction = async ({
  userId,
  currentPage,
}: GetUserCurrentConditionsProps,
) => {
  // Get user stations from DB
  const startAt = (currentPage - 1) * PAGE_SIZE;
  const userStationsSnapshot = await currentConditions.where("userId", "==", userId).orderBy("order").startAt(startAt).limit(PAGE_SIZE).get();

  const userCurrentConditions: CurrentConditions[] = userStationsSnapshot.docs.map(doc => {
    return {
      ...doc.data() as CurrentConditions,
    };
  });

  // Verify how many api requests are needed and get an api key with enough available requests
  const currentUnixTime = Date.now();
  const lastFetchUnixArray = userCurrentConditions.map((station) => station.lastFetchUnix);

  const apiKey = await getApiKey({ currentUnixTime, lastFetchUnixArray });

  if (!apiKey) {
    return {
      currentConditions: userCurrentConditions,
      fetchUnix: currentUnixTime,
    };
  }

  // Create an array with the urls to fetch data from Weather Underground (WU)
  const weatherDataFetchUrls: WeatherDataFetchUrlsProps[] = [];
  userCurrentConditions.forEach((station) => {
    const minutesSinceLastFetch = (currentUnixTime - station.lastFetchUnix) / 1000 / 60;

    weatherDataFetchUrls.push({
      station,
      urlCurrent: getCurrentConditionsUrl(station.stationID, apiKey),
      shouldFetchNewData: minutesSinceLastFetch > MINUTES_TO_FETCH_NEW_DATA,
    });
  });

  const offlineStations: CurrentConditions[] = [];

  // Fetch data from WU API, or return the current data from DB if the data is not outdated
  const currentConditionsData = await Promise.allSettled(
    weatherDataFetchUrls.map(async ({ station, urlCurrent, shouldFetchNewData }) => {

      try {
        if (shouldFetchNewData) {
          const response = await fetch(urlCurrent);
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

  const currentConditionsArray: CurrentConditions[] = [];

  // Create an array with the current conditions
  currentConditionsData.forEach((data) => {
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

    const {
      humidity,
      solarRadiation,
      uv,
      winddir,
    } = observations;

    const {
      dewpt,
      elev,
      heatIndex,
      precipRate,
      precipTotal,
      pressure,
      temp,
      windChill,
      windGust,
      windSpeed,
    } = observations.metric;

    station.conditions = {
      dewPoint: formatValue(dewpt),
      humidity: formatValue(humidity),
      elevation: formatValue(elev),
      heatIndex: formatValue(heatIndex),
      precipRate: formatValue(precipRate),
      precipTotal: formatValue(precipTotal),
      pressure: formatValue(pressure),
      temperature: formatValue(temp),
      windChill: formatValue(windChill),
      windGust: formatValue(windGust),
      windSpeed: formatValue(windSpeed),
      solarRadiation: formatValue(solarRadiation),
      windDirection: formatValue(winddir),
      uv: formatValue(uv),
    };

    currentConditionsArray.push(station);
  });

  return {
    currentConditions: currentConditionsArray,
    fetchUnix: currentUnixTime,
  };
};
