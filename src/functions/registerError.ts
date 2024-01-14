import { collection, addDoc } from "firebase/firestore";

import { firestore } from "../services/api";
import { User } from "../models/user";

export async function registerError(error: any, user: User) {
  const isDevEnv = window.location.host.includes("localhost");

  if (isDevEnv) return;

  const errorCol = collection(firestore, "errors");

  const errorObject = {
    user,
    error: {
      name: error.name,
      message: error.message,
      stack: JSON.stringify(error.stack),
    },
    createdAt: Date.now(),
  };

  try {
    await addDoc(errorCol, errorObject);
  } catch (error) {
    console.log(error);
  }
}
