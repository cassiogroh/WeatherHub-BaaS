import * as admin from "firebase-admin";

import { getForecastFunction } from "./getForecast";
import { loadStationsFunction } from "./loadStations";

admin.initializeApp();

export const firestore = admin.firestore();

export const getForecast = getForecastFunction;
export const loadStations = loadStationsFunction;
