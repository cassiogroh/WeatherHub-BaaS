import { subscriptionStatus } from "../subscriptionInfo";
import { getCurrentConditionsUrl, getHistoricUrl } from "../apiInfo";
import { StationProps } from "../../models/station";

export interface WeatherDataFetchUrlsProps<T extends StationProps> {
  station: T;
  fetchUrl: string;
  shouldFetchNewData: boolean;
}

interface GetUrlsToFetchProps<T extends StationProps> {
  dbConditions: T[];
  currentUnixTime: number;
  apiKey: string;
  fetchType: "current" | "historic";
}

export const getUrlsToFetch = async <T extends StationProps>({ dbConditions, currentUnixTime, apiKey, fetchType }: GetUrlsToFetchProps<T>) => {
  const minimumFetchTimeout = subscriptionStatus.tierThree.fetchTimeoutInMin;

  const getConditionsUrl = fetchType === "current" ? getCurrentConditionsUrl : getHistoricUrl;

  // Create an array with the urls to fetch data from Weather Underground (WU)
  const weatherDataFetchUrls: WeatherDataFetchUrlsProps<T>[] = [];
  dbConditions.forEach((station) => {
    const minutesSinceLastFetch = (currentUnixTime - station.lastFetchUnix) / 1000 / 60;

    weatherDataFetchUrls.push({
      station,
      fetchUrl: getConditionsUrl(station.stationId, apiKey),
      shouldFetchNewData: minutesSinceLastFetch > minimumFetchTimeout,
    });
  });

  return weatherDataFetchUrls;
};
