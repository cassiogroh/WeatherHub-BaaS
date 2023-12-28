import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";

import { auth, firestore } from "../services/api";
import { User } from "../hooks/auth";

export async function registerUser(name: string, email: string, password: string): Promise<User> {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    const newUser: User = {
      userId: user.uid,
      name,
      email,
      stations: ["ISANTACA85"],
      stations_names: ["Brusque - Centro"],
      created_at: (new Date()).toUTCString(),
    };

    await setDoc(doc(collection(firestore, "users"), newUser.userId), newUser);

    return newUser;
  } catch (error) {
    console.log(error)
    const typedError = error as Error;
    throw new Error(typedError.message);
  }
}
