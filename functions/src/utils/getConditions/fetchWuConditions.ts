import { StationProps } from "../../models/station";
import { WeatherDataFetchUrlsProps } from "./getUrlsToFetch";

interface FetchWuConditionsProps<T extends StationProps> {
  weatherDataFetchUrls: WeatherDataFetchUrlsProps<T>[];
}

export const fetchWuConditions = async <T extends StationProps>({ weatherDataFetchUrls }: FetchWuConditionsProps<T>) => {
  const offlineStations: T[] = [];

  const now = Date.now();

  // Fetch data from WU API, or return the current data from DB if the data is not outdated
  const conditionsData = await Promise.allSettled(
    weatherDataFetchUrls.map(async ({ station, fetchUrl }) => {

      try {
        const response = await fetch(fetchUrl);
        const responseData = await response.json();
        return {
          responseData,
          station,
        };
      } catch (error) {
        console.error(error);

        station.status = "offline";
        station.observationTimeUTC = new Date(now).toISOString();
        station.lastFetchUnix = now;
        offlineStations.push(station);
        return;
      }
    },
    ),
  );

  return { conditionsData, offlineStations };
};
