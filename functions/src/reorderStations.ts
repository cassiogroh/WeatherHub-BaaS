import * as admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import { User } from "./models/user";
import { requireAuth } from "./utils/requireAuth";

interface ReorderStationsProps {
  stationsIds: string[]; // every station of the user, in the new order
}

export const reorderStationsFunction = onCall(async (request) => {
  const userId = requireAuth(request);
  const { stationsIds } = request.data as ReorderStationsProps;

  if (!Array.isArray(stationsIds) || stationsIds.some((id) => typeof id !== "string")) {
    throw new HttpsError("invalid-argument", "stationsIds must be a list of station ids");
  }

  const firestore = admin.firestore();
  const userRef = firestore.collection("users").doc(userId);

  await firestore.runTransaction(async (transaction) => {
    const userSnapshot = await transaction.get(userRef);
    const user = userSnapshot.data() as User;

    // The new order must contain exactly the stations the user has, each once
    const isSameStations =
      stationsIds.length === user.wuStations.length &&
      new Set(stationsIds).size === stationsIds.length &&
      user.wuStations.every((station) => stationsIds.includes(station.id));

    if (!isSameStations) {
      throw new HttpsError("failed-precondition", "Stations list is outdated, reload the page");
    }

    const wuStations = user.wuStations
      .map((station) => ({ ...station, order: stationsIds.indexOf(station.id) }))
      .sort((a, b) => a.order - b.order);

    transaction.update(userRef, { wuStations });
  });

  return { success: true };
});
