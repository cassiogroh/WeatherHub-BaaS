import { onCall } from "firebase-functions/v2/https";

import { loadStationsService } from "./utils/loadStationsService";
import { getCurrentConditionsUrl } from "./utils/api_info";
import { User } from "./models/user";
import { firestore } from "./index";

interface Request {
  stationId: string;
  userId: string;
}

export const addNewStationFunction = onCall(async (request) => {
  const { stationId, userId } = request.data as Request;

  const upperStationId = stationId.toUpperCase();

  const userSnapshot = await firestore.collection("users").doc(userId).get();
  const user = userSnapshot.data() as User;

  const checkStationExists = (): void => {
    const stationExists = user.stations.find(station => station === upperStationId);
    if (stationExists) {
      throw new Error("Station alredy included");
    }
  };

  const checkStationIsValid = async () => {
    const response =
      await fetch(getCurrentConditionsUrl(upperStationId))
        .catch(() => {
          throw new Error("Invalid station ID or station is currently offline");
        });

    if (response.status !== 200) {
      throw new Error("Invalid station ID or station is currently offline");
    } else {
      return response.json();
    }
  }

  checkStationExists();
  const response = await checkStationIsValid();

  user.stations.push(upperStationId);
  user.stations_names.push(response.observations[0].neighborhood);

  await firestore
    .collection("users")
    .doc(userId)
    .update({
      stations: user.stations,
      stations_names: user.stations_names,
    });

  const newStation = await loadStationsService({ userId, singleStationId: upperStationId });

  return newStation;
});
