import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";

import { User } from "./models/user";

interface RenameStationProps {
  stationId: string;
  newName: string;
  userId: string;
}

export const renameStationFunction = onCall(async (request) => {
  const { stationId, newName, userId } = request.data as RenameStationProps;

  const firestore = admin.firestore();
  const usersCol = firestore.collection("users");

  const upperCaseStationId = stationId.toUpperCase();

  const userSnapshot = await usersCol.doc(userId).get();
  const user = userSnapshot.data() as User;

  const stationIndex = user.stations.findIndex(station => station.id === upperCaseStationId);

  if (stationIndex < 0) {
    return {
      error: "Station not found",
      success: false,
    };
  }

  await usersCol
    .doc(userId)
    .update({
      [`stations.${stationIndex}.name`]: newName,
    });

  return;
});
