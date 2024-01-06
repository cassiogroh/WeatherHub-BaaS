import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";

import { User } from "./models/user";

interface DeleteStationProps {
  stationId: string;
  userId: string;
}

export const deleteStationFunction = onCall(async (request) => {
  const { stationId, userId } = request.data as DeleteStationProps;

  const firestore = admin.firestore();
  const usersCol = firestore.collection("users");
  const fieldValue = admin.firestore.FieldValue;

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

  const stationToBeRemoved = user.wuStations[stationIndex];

  // Remove station on the user instance on firestore
  usersCol.doc(userId).update({
    wuStations: fieldValue.arrayRemove(stationToBeRemoved),
  });

  return {
    error: "",
    success: true,
  };
});
