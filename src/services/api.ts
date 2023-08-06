import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

import { firebaseConfig } from "./environments/production";

const firebaseSDK = initializeApp(firebaseConfig);

const firestore = getFirestore(firebaseSDK);
const functions = getFunctions(firebaseSDK);

export { firestore, functions };
