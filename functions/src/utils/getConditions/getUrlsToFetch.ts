import { subscriptionStatus } from "../subscriptionInfo";
import { getCurrentConditionsUrl } from "../apiInfo";

export interface CommonProps {
  lastFetchUnix: number;
  stationID: string;
}

export interface WeatherDataFetchUrlsProps<T extends CommonProps> {
  station: T;
  fetchUrl: string;
  shouldFetchNewData: boolean;
}

interface GetUrlsToFetchProps<T extends CommonProps> {
  dbConditions: T[];
  currentUnixTime: number;
  apiKey: string;
}

export const getUrlsToFetch = async <T extends CommonProps>({ dbConditions, currentUnixTime, apiKey }: GetUrlsToFetchProps<T>) => {
  const minimumFetchTimeout = subscriptionStatus.tierThree.fetchTimeoutInMin;

  // Create an array with the urls to fetch data from Weather Underground (WU)
  const weatherDataFetchUrls: WeatherDataFetchUrlsProps<T>[] = [];
  dbConditions.forEach((station) => {
    const minutesSinceLastFetch = (currentUnixTime - station.lastFetchUnix) / 1000 / 60;

    weatherDataFetchUrls.push({
      station,
      fetchUrl: getCurrentConditionsUrl(station.stationID, apiKey),
      shouldFetchNewData: minutesSinceLastFetch > minimumFetchTimeout,
    });
  });

  return weatherDataFetchUrls;
};
