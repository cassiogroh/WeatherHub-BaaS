import { onCall } from "firebase-functions/v2/https";
import { loadStationsService } from "./utils/loadStationsService";

interface LoadStationsProps {
  userId?: string;
  singleStationId?: string;
}

export interface UrlArray {
  stationID: string;
  urlCurrent: string;
  urlHistoric: string;
}

export const loadStationsFunction = onCall(async (request) => {
  const { userId, singleStationId } = request.data as LoadStationsProps;

  const stationsArray = await loadStationsService({ userId, singleStationId });

  return stationsArray;
});
