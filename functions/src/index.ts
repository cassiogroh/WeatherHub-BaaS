import * as admin from "firebase-admin";

import { getForecastFunction } from "./getForecast";

admin.initializeApp();

export const getForecast = getForecastFunction;
