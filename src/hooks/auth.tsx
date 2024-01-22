import { createContext, useCallback, useState, useContext, useEffect } from "react";
import {
  onAuthStateChanged,
  signOut as signOutFromFirebase,
  sendPasswordResetEmail as sendPasswordResetEmailFirebase } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import { auth } from "../services/api";
import { signIntoFirebase } from "../functions/signIn";
import { getUserFromFirestore } from "../functions/getUser";
import { User } from "../models/user";

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  user: User;
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut(): void;
  updateUser(user: User): void;
  sendResetPasswordEmail(email: string): Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const userMock = {} as User;
  const [user, setUser] = useState<User>(userMock);

  useEffect(() => {
    const fetchData = async () => {
      const storedUser = localStorage.getItem("@WeatherHub:user");

      if (!storedUser) return;

      const { userId } = JSON.parse(storedUser);

      onAuthStateChanged(auth, async (authUser) => {
        if (authUser) {
          const firestoreUser = await getUserFromFirestore(userId);
          localStorage.setItem("@WeatherHub:user", JSON.stringify(firestoreUser));
          setUser(firestoreUser as any);
        } else {
          setUser({} as User);
        }
      });
    };

    fetchData();
  }, []);

  const signIn = useCallback(async ({ email, password }: SignInCredentials) => {
    const authUser = await signIntoFirebase(email, password);

    const firestoreUser = await getUserFromFirestore(authUser.uid);

    localStorage.setItem("@WeatherHub:user", JSON.stringify(firestoreUser));

    setUser(firestoreUser  as any);
  }, []);

  const signOut = useCallback(async () => {
    await signOutFromFirebase(auth);
    localStorage.removeItem("@WeatherHub:user");

    setUser({} as User);

    navigate("/");
  }, [navigate]);

  const updateUser = useCallback((user: User) => {
    localStorage.setItem("@WeatherHub:user", JSON.stringify(user));

    setUser(user);
  }, [setUser]);

  const sendResetPasswordEmail = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmailFirebase(auth, email);
    } catch (error) {
      console.log(error);
      throw new Error("Erro ao enviar e-mail de recuperação de senha.");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, updateUser, sendResetPasswordEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export { AuthProvider, useAuth };
