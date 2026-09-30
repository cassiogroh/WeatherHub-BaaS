import { getFirestore } from "firebase-admin/firestore";
import { onCall } from "firebase-functions/v2/https";

import { User } from "./models/user";
import { requireAuth } from "./utils/requireAuth";
import { parseStationId, parseText } from "./utils/validation";

interface RenameStationProps {
  stationId: string;
  newName: string;
}

export const renameStationFunction = onCall(async (request) => {
  const userId = requireAuth(request);
  const data = request.data as RenameStationProps;
  const stationId = parseStationId(data?.stationId);
  const newName = parseText(data?.newName, "station name", 60);

  const firestore = getFirestore();
  const usersCol = firestore.collection("users");

  const upperCaseStationId = stationId.toUpperCase();

  const userSnapshot = await usersCol.doc(userId).get();
  const user = userSnapshot.data() as User;

  const stationIndex = user.wuStations.findIndex(station => station.id === upperCaseStationId);

  if (stationIndex < 0) {
    return {
      error: "Station not found",
      success: false,
    };
  }

  user.wuStations[stationIndex].name = newName;
  const userStationsUpdated = user.wuStations;

  await usersCol
    .doc(userId)
    .update({
      wuStations: userStationsUpdated,
    });

  return {
    error: "",
    success: true,
  };
});
