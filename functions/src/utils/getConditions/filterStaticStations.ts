import { differenceInMinutes } from "date-fns";
import { StationProps } from "../../models/station";
import { User } from "../../models/user";
import { subscriptionStatus } from "../subscriptionInfo";

interface FilterStaticStationsProps<T extends StationProps> {
  dbConditions: T[];
  currentUnixTime: number;
  user: User;
}

export const filterStaticStations = <T extends StationProps>({ dbConditions, currentUnixTime, user }: FilterStaticStationsProps<T>) => {
  const { subscription } = user;

  const { fetchTimeoutInMin } = subscriptionStatus[subscription];

  const staticStations = [] as T[];
  const stationsToFetch = [] as T[];

  dbConditions.forEach((station) => {
    const { lastFetchUnix } = station;
    const minutesSinceLastStationFetch = differenceInMinutes(currentUnixTime, lastFetchUnix);

    if (fetchTimeoutInMin > minutesSinceLastStationFetch) {
      staticStations.push(station);
    } else {
      stationsToFetch.push(station);
    }
  });

  return {
    staticStations,
    stationsToFetch,
  };
};
