import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";

import { firebaseConfig } from "./environments/production";

import mocks from "./mocks.json";
import { cloudFunctions } from "./cloudFunctions";

const firebaseApp = initializeApp(firebaseConfig);

const firestore = getFirestore(firebaseApp);
const functions = getFunctions(firebaseApp);
const auth = getAuth(firebaseApp);

const USE_MOCK = false; // false to get requests from WU via API key/true for instant mock data
const IS_PRODUCTION = window.location.host === "weatherhub.app";

const callableFunction = async (functionName: string, params?: any) => {
  const untypedMock = mocks as any;
  let mockData = untypedMock[functionName];

  if (USE_MOCK && !IS_PRODUCTION && mockData) {
    console.log("Using mock data for " + functionName);

    if (
      functionName === cloudFunctions.getCurrentConditions ||
      functionName === cloudFunctions.getHistoricalConditions
    ) {
      const dataProperty = functionName.substring(3);
      const propertyName = dataProperty.charAt(0).toLowerCase() + dataProperty.slice(1);
      const data = mockData[propertyName];
      const newMock = {
        [propertyName]: data.filter(({ stationId }) => params.stationsIds.includes(stationId)),
      };

      mockData = newMock;
    }

    // Return a new Promise that resolves after 500ms with the mockData
    return new Promise(resolve => setTimeout(() => resolve(mockData), 500));
  }

  const functionInstance = httpsCallable(functions, functionName);
  const response: any = await functionInstance(params);
  return response.data;
};

// Use functions emulator (comment out for production)
// connectFunctionsEmulator(functions, "127.0.0.1", 5001); // import from "firebase/functions"

export { firestore, functions, auth, callableFunction };
