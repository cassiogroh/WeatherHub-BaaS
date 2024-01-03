import { onCall } from "firebase-functions/v2/https";

import { User } from "./models/user";
import { users } from "./utils/collections";

interface RenameStationProps {
  stationId: string;
  newName: string;
  userId: string;
}

export const renameStationFunction = onCall(async (request) => {
  const { stationId, newName, userId } = request.data as RenameStationProps;

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

  await users
    .doc(userId)
    .update({
      [`stations.${stationIndex}.name`]: newName,
    });

  return;
});
