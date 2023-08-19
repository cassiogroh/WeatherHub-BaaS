import { onCall } from "firebase-functions/v2/https";

import { User } from "./models/user";
import { firestore } from "./index";

interface Request {
  stationId: string;
  userId: string;
}

export const deleteStationFunction = onCall(async (request) => {
  const { stationId, userId } = request.data as Request;

  const upperStationId = stationId.toUpperCase();

  const userSnapshot = await firestore.collection('users').doc(userId).get();
  const user = userSnapshot.data() as User;

  const stationIndex = user.stations.findIndex(station => station === upperStationId);

  if (stationIndex < 0) {
    throw new Error('Station not found');
  }

  user.stations.splice(stationIndex, 1);
  user.stations_names.splice(stationIndex, 1);

  await firestore
    .collection('users')
    .doc(userId)
    .update({
      stations: user.stations,
      stations_names: user.stations_names
    });

  return;
});
