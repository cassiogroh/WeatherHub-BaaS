import * as admin from "firebase-admin";

import { getForecastFunction } from "./getForecast";
import { addNewStationFunction } from "./addNewStation";
import { deleteStationFunction } from "./deleteStation";
import { renameStationFunction } from "./renameStation";
import { updateProfileFunction } from "./updateProfile";
import { deleteAccountFunction } from "./deleteAccount";
import { getCurrentConditionsFunction } from "./getCurrentConditions";
import { getHistoricConditionsFunction } from "./getHistoricConditions";
import { resetApiKeysUsageFunction } from "./resetApiKeysUsage";

// Uncomment when using functions emulator
// import serviceAccount = require("./serviceAccount.json");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
//   databaseURL: "https://weatherhub-app.firebaseio.com",
// });

admin.initializeApp();

export const getForecast = getForecastFunction;
export const addNewStation = addNewStationFunction;
export const deleteStation = deleteStationFunction;
export const renameStation = renameStationFunction;
export const updateProfile = updateProfileFunction;
export const resetApiKeysUsage = resetApiKeysUsageFunction;
export const getCurrentConditions = getCurrentConditionsFunction;
export const getHistoricConditions = getHistoricConditionsFunction;
export const deleteAccount = deleteAccountFunction;
