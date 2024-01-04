import * as admin from "firebase-admin";

import { getForecastFunction } from "./getForecast";
import { addNewStationFunction } from "./addNewStation";
import { deleteStationFunction } from "./deleteStation";
import { renameStationFunction } from "./renameStation";
import { updateProfileFunction } from "./updateProfile";
import { getCurrentConditionsFunction } from "./getCurrentConditions";
import { getHistoricConditionsFunction } from "./getHistoricConditions";

admin.initializeApp();

export const getForecast = getForecastFunction;
export const addNewStation = addNewStationFunction;
export const deleteStation = deleteStationFunction;
export const renameStation = renameStationFunction;
export const updateProfile = updateProfileFunction;
export const getCurrentConditions = getCurrentConditionsFunction;
export const getHistoricConditions = getHistoricConditionsFunction;
