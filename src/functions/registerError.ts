import { collection, addDoc } from "firebase/firestore";

import { firestore } from "../services/api";
import { User } from "../models/user";

export async function registerError(error: any, user: User) {
  const errorCol = collection(firestore, "errors");

  const errorObject = {
    user,
    error,
    createdAt: Date.now(),
  };

  try {
    await addDoc(errorCol, errorObject);
  } catch (error) {
    console.log(error);
  }
}
