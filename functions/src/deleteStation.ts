import { onCall } from "firebase-functions/v2/https";

import { User } from "./models/user";
import { fieldValue } from "./index";
import { users } from "./utils/collections";

interface DeleteStationProps {
  stationId: string;
  userId: string;
}

export const deleteStationFunction = onCall(async (request) => {
  const { stationId, userId } = request.data as DeleteStationProps;

  const upperCaseStationId = stationId.toUpperCase();

  const userSnapshot = await users.doc(userId).get();
  const user = userSnapshot.data() as User;

  const stationIndex = user.stations.findIndex(station => station.id === upperCaseStationId);

  if (stationIndex < 0) {
    return {
      error: "Station not found",
      success: false,
    };
  }

  const stationToBeRemoved = user.stations[stationIndex];

  // Remove station on the user instance on firestore
  users.doc(userId).update({
    stations: fieldValue.arrayRemove(stationToBeRemoved),
  });

  return {
    success: true,
  };
});
