import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";

import { getCurrentConditionsUrl, getHistoricUrl } from "./utils/apiInfo";
import { User } from "./models/user";
import { verifyUserSubscription } from "./utils/getConditions/verifyUserSubscription";
import { getApiKey } from "./utils/getApiKey";
import { buildCurrentConditions } from "./utils/getConditions/buildCurrentConditions";
import { CurrentApiResponse } from "./getCurrentConditions";
import { HistoricApiResponse } from "./getHistoricConditions";
import { buildHistoricConditions } from "./utils/getConditions/buildHistoricConditions";
import { updateApiKey } from "./utils/getConditions/updateApiKey";

interface AddNewStationProps {
  stationId: string;
  userId: string;
}

export const addNewStationFunction = onCall(async (request) => {
  const { stationId, userId } = request.data as AddNewStationProps;

  const firestore = admin.firestore();
  const usersCol = firestore.collection("users");
  const currentConditionsCol = firestore.collection("currentConditions");
  const historicConditionsCol = firestore.collection("historicConditions");
  const fieldValue = admin.firestore.FieldValue;

  const currentUnixTime = Date.now();

  const upperCaseStationId = stationId.toUpperCase();

  const userSnapshot = await usersCol.doc(userId).get();
  const user = userSnapshot.data() as User;

  // Verify if user already has this station added to their collection
  const userAlreadyHasStation = user.wuStations.some((station) => station.id === upperCaseStationId);

  if (userAlreadyHasStation) {
    return {
      error: "User already has this station",
      success: false,
    };
  }

  // Verify if the user can add a new station based on their subscription limit
  const { userCanAddNewStation } = await verifyUserSubscription({ user, currentUnixTime });

  if (!userCanAddNewStation) {
    return {
      error: "User cannot add more stations",
      success: false,
    };
  }

  // Get API key to perform the request
  const apiKey = await getApiKey({ numberOfRequests: 2 });

  if (!apiKey){
    return {
      error: "No API key available",
      success: false,
    };
  }

  // Fetch data from WU API
  const currentConditionsUrl = getCurrentConditionsUrl(upperCaseStationId, apiKey.key);
  const historicConditionsUrl = getHistoricUrl(upperCaseStationId, apiKey.key);

  const currentConditionsResponse = await fetch(currentConditionsUrl);
  const historicConditionsResponse = await fetch(historicConditionsUrl);

  // If the request was not successful, return an error
  if (currentConditionsResponse.status !== 200 || historicConditionsResponse.status !== 200) {
    return {
      error: "Error fetching data from Weather Underground",
      success: false,
    };
  }

  // If the request was successful, return the data
  const currentConditionsRaw = await currentConditionsResponse.json() as CurrentApiResponse;
  const historicConditionsRaw = await historicConditionsResponse.json() as HistoricApiResponse;

  const { neighborhood, country, softwareType } = currentConditionsRaw.observations[0];

  const currentConditionsObject = buildCurrentConditions({
    currentConditions: currentConditionsRaw,
    lastFetchUnix: currentUnixTime,
  });

  const historicConditionsObject = buildHistoricConditions({
    historicConditions: historicConditionsRaw,
    lastFetchUnix: currentUnixTime,
    country,
    neighborhood,
    softwareType,
  });

  // Add the new station to the current conditions collection
  await currentConditionsCol.doc(upperCaseStationId).set(currentConditionsObject, { merge: true });

  // Add the new station to the historic conditions collection
  await historicConditionsCol.doc(upperCaseStationId).set(historicConditionsObject, { merge: true });

  // Add the new station to the user's collection
  await usersCol.doc(userId).update("wuStations", fieldValue.arrayUnion({
    id: upperCaseStationId,
    name: neighborhood || upperCaseStationId,
    order: user.wuStations.length,
    createdAt: currentUnixTime,
  }));

  apiKey.currentUsage += 2;
  apiKey.lastUsedAt = currentUnixTime;
  await updateApiKey({ apiKey });

  return {
    success: true,
    currentConditions: currentConditionsObject,
    historicConditions: historicConditionsObject,
  };
});
