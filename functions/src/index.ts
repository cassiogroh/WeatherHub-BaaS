import * as admin from "firebase-admin";

import { getForecastFunction } from "./getForecast";
import { loadStationsFunction } from "./loadStations";
import { addNewStationFunction } from "./addNewStation";
import { deleteStationFunction } from "./deleteStation";
import { renameStationFunction } from "./renameStation";
import { updateProfileFunction } from "./updateProfile";
import { getUserCurrentConditionsFunction } from "./getUserCurrentConditions";

admin.initializeApp();

export const firestore = admin.firestore();

export const getForecast = getForecastFunction;
export const loadStations = loadStationsFunction;
export const addNewStation = addNewStationFunction;
export const deleteStation = deleteStationFunction;
export const renameStation = renameStationFunction;
export const updateProfile = updateProfileFunction;
export const getUserCurrentConditions = getUserCurrentConditionsFunction;
