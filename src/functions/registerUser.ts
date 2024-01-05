import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";

import { auth, firestore } from "../services/api";
import { SubscriptionStatus, User } from "../models/user";

export async function registerUser(name: string, email: string, password: string): Promise<User> {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    const now = Date.now();

    const newUser: User = {
      userId: user.uid,
      name,
      email,
      wuStations: [{
        id: "ISANTACA85",
        name: "Brusque - Centro",
        order: 0,
        createdAt: now,
      }],
      created_at: now,
      subscription: SubscriptionStatus.free,
      lastDataFetchUnix: now,
    };

    await setDoc(doc(collection(firestore, "users"), newUser.userId), newUser);

    return newUser;
  } catch (error) {
    console.log(error);
    const typedError = error as Error;
    throw new Error(typedError.message);
  }
}
