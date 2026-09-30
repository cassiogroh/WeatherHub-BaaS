import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onCall } from "firebase-functions/v2/https";

import { User } from "./models/user";
import { requireAuth } from "./utils/requireAuth";
import { parseStationId } from "./utils/validation";

interface DeleteStationProps {
  stationId: string;
}

export const deleteStationFunction = onCall(async (request) => {
  const userId = requireAuth(request);
  const stationId = parseStationId((request.data as DeleteStationProps)?.stationId);

  const firestore = getFirestore();
  const usersCol = firestore.collection("users");
  const fieldValue = FieldValue;

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
