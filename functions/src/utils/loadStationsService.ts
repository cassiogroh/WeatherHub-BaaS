import { firestore } from "..";
import { User } from "../models/user";
import { handleStationsRequest } from "./handleStationsRequest";
import { populateStations } from "./populateStations";

interface LoadStationsProps {
  userId?: string;
  singleStationId?: string;
}

export const loadStationsService = async (request: LoadStationsProps) => {
  const { userId, singleStationId } = request as LoadStationsProps;

  let user = {} as User;
  if (userId) {
    const userSnapshot = await firestore.collection("users").doc(userId).get();
    user = userSnapshot.data() as User;
  }

  const urlArray = await handleStationsRequest({ user, singleStationId });
  const stationsArray = await populateStations({ urlArray, user });

  return stationsArray;
}
