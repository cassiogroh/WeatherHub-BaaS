import * as admin from "firebase-admin";

import { getForecastFunction } from "./getForecast";
import { loadStationsFunction } from "./loadStations";
import { addNewStationFunction } from "./addNewStation";

admin.initializeApp();

export const firestore = admin.firestore();

export const getForecast = getForecastFunction;
export const loadStations = loadStationsFunction;
export const addNewStation = addNewStationFunction;
