import { getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

import { User } from "./models/user";
import { requireAuth } from "./utils/requireAuth";
import { parseStationsIds } from "./utils/validation";

interface ReorderStationsProps {
  stationsIds: string[]; // every station of the user, in the new order
}

export const reorderStationsFunction = onCall(async (request) => {
  const userId = requireAuth(request);
  // Not a query, so the list can be as long as the user's stations
  const stationsIds = parseStationsIds((request.data as ReorderStationsProps)?.stationsIds, 500);

  const firestore = getFirestore();
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
