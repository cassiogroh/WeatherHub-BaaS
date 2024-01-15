import { getCurrentConditionsUrl, getHistoricUrl } from "../apiInfo";
import { StationProps } from "../../models/station";

export interface WeatherDataFetchUrlsProps<T extends StationProps> {
  station: T;
  fetchUrl: string;
}

interface GetUrlsToFetchProps<T extends StationProps> {
  dbConditions: T[];
  apiKey: string;
  fetchType: "current" | "historic";
}

export const getUrlsToFetch = async <T extends StationProps>({ dbConditions, apiKey, fetchType }: GetUrlsToFetchProps<T>) => {
  const getConditionsUrl = fetchType === "current" ? getCurrentConditionsUrl : getHistoricUrl;

  // Create an array with the urls to fetch data from Weather Underground (WU)
  const weatherDataFetchUrls: WeatherDataFetchUrlsProps<T>[] = [];
  dbConditions.forEach((station) => {
    weatherDataFetchUrls.push({
      station,
      fetchUrl: getConditionsUrl(station.stationId, apiKey),
    });
  });

  return weatherDataFetchUrls;
};
