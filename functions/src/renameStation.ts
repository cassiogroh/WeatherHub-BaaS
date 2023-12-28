import { onCall } from "firebase-functions/v2/https";

import { firestore } from ".";
import { User } from "./models/user";

interface Request {
  stationId: string;
  newName: string;
  userId: string;
}

export const renameStationFunction = onCall(async (request) => {
  const { stationId, newName, userId } = request.data as Request;

  const upperStationId = stationId.toUpperCase();

  const userSnapshot = await firestore.collection("users").doc(userId).get();
  const user = userSnapshot.data() as User;

  const stationIndex = user.stations.findIndex(station => station === upperStationId);

  if (stationIndex < 0) {
    throw new Error("Station not found");
  }

  user.stations_names.splice(stationIndex, 1, newName);

  await firestore
    .collection("users")
    .doc(userId)
    .update({
      stations_names: user.stations_names,
    });

  return;
});
