import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/api";

export async function signIntoFirebase(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return user;
  } catch (error) {
    console.error("Error signing in with email and password:", error);
    throw error;
  }
}
