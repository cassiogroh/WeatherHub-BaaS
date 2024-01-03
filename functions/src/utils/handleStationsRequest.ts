import { getCurrentConditionsUrl, getHistoricUrl, apiInfo } from "./apiInfo";
import { UrlArray } from "../loadStations";
import { User } from "../models/user";

interface HandleStationsRequestProps {
  user: User;
  singleStationId?: string;
}

export const handleStationsRequest = async ({ user, singleStationId }: HandleStationsRequestProps): Promise<UrlArray[]> => {
  const urlArray: UrlArray[] = [];

  if (user.stations) {
    // Grabing data for user page
    let userStations: string | string[];

    if (!singleStationId) {
      userStations = user.stations;

      for (let i = 0; i < userStations.length; i++) {
        urlArray[i] = {
          stationID: userStations[i],
          urlCurrent: getCurrentConditionsUrl(userStations[i]),
          urlHistoric: getHistoricUrl(userStations[i]),
        };
      }

    } else { // used when adding a station to dashboard
      userStations = user.stations[user.stations.length-1];

      urlArray[0] = {
        stationID: singleStationId,
        urlCurrent: getCurrentConditionsUrl(singleStationId),
        urlHistoric: getHistoricUrl(singleStationId),
      };
    }
  } else {
    // Grabing data for home page
    for (let i = 0; i < apiInfo.stationsId.length; i++) {
      urlArray[i] = {
        stationID: apiInfo.stationsId[i],
        urlCurrent: getCurrentConditionsUrl(apiInfo.stationsId[i]),
        urlHistoric: getHistoricUrl(apiInfo.stationsId[i]),
      };
    }
  }

  return urlArray;
};
