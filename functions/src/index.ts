import { initializeApp } from "firebase-admin/app";

import { signUpFunction } from "./signUp";
import { getForecastFunction } from "./getForecast";
import { addNewStationFunction } from "./addNewStation";
import { deleteStationFunction } from "./deleteStation";
import { renameStationFunction } from "./renameStation";
import { reorderStationsFunction } from "./reorderStations";
import { updateProfileFunction } from "./updateProfile";
import { deleteAccountFunction } from "./deleteAccount";
import { getCurrentConditionsFunction } from "./getCurrentConditions";
import { getHistoricConditionsFunction } from "./getHistoricConditions";
import { resetApiKeysUsageFunction } from "./resetApiKeysUsage";

// Uncomment when using functions emulator (and import cert and ServiceAccount from "firebase-admin/app")
// import serviceAccount = require("./serviceAccount.json");
// initializeApp({
//   credential: cert(serviceAccount as ServiceAccount),
//   databaseURL: "https://weatherhub-app.firebaseio.com",
// });

initializeApp();

export const signUp = signUpFunction;
export const getForecast = getForecastFunction;
export const addNewStation = addNewStationFunction;
export const deleteStation = deleteStationFunction;
export const renameStation = renameStationFunction;
export const reorderStations = reorderStationsFunction;
export const updateProfile = updateProfileFunction;
export const resetApiKeysUsage = resetApiKeysUsageFunction;
export const getCurrentConditions = getCurrentConditionsFunction;
export const getHistoricConditions = getHistoricConditionsFunction;
export const deleteAccount = deleteAccountFunction;
