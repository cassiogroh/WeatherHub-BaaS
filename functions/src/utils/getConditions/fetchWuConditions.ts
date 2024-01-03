import { StationProps } from "../../models/station";
import { WeatherDataFetchUrlsProps } from "./getUrlsToFetch";

interface FetchWuConditionsProps<T extends StationProps> {
  weatherDataFetchUrls: WeatherDataFetchUrlsProps<T>[];
}

export const fetchWuConditions = async <T extends StationProps>({ weatherDataFetchUrls }: FetchWuConditionsProps<T>) => {
  const offlineStations: T[] = [];

  // Fetch data from WU API, or return the current data from DB if the data is not outdated
  const conditionsData = await Promise.allSettled(
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

  return { conditionsData, offlineStations };
};
