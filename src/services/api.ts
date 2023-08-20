import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions";

import { firebaseConfig } from "./environments/production";

const firebaseApp = initializeApp(firebaseConfig);

const firestore = getFirestore(firebaseApp);
const functions = getFunctions(firebaseApp);
const auth = getAuth(firebaseApp);

const USE_MOCK = false; // false to get requests from WU via API key/true for instant mock data
const callableFunction = async (functionName: string, params?: any, mockData?: any) => {
  if (USE_MOCK && mockData) return mockData;

  const functionInstance = httpsCallable(functions, functionName);
  const response: any = await functionInstance(params);
  return response.data;
}

// Use functions emulator (comment out for production)
connectFunctionsEmulator(functions, '127.0.0.1', 5001); // import from "firebase/functions"

export { firestore, functions, auth, callableFunction };
