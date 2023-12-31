import { firestore } from "..";

export const users = firestore.collection("users");
export const currentConditions = firestore.collection("currentConditions");
export const historicConditions = firestore.collection("historicConditions");
export const wuApiKeys = firestore.collection("wuApiKeys");
