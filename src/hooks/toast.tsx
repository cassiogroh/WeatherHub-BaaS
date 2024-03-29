import {
  createContext,
  useContext,
  useCallback,
  useState,
} from "react";
import { v4 as uuid } from "uuid";

import ToastContainer from "../components/ToastContainer";

export interface ToastMessage {
  id: string;
  /** Defaults to "info" */
  type?: "success" | "error" | "info";
  title: string;
  description?: string;
  /** Timeout for the toast to disapear in milisenconds. Defaults to 6000. */
  timeout?: number;
}

interface ToastContextData {
  addToast(message: Omit<ToastMessage, "id">): void;
  removeToast(id: string): void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    ({ type, title, description, timeout }: Omit<ToastMessage, "id">) => {
      const id = uuid();

      const toast = {
        id,
        type,
        title,
        description,
        timeout,
      };

      setMessages(state => [ ...state, toast ]);
    }, []);

  const removeToast = useCallback((id: string) => {
    setMessages(state => state.filter(message => message.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer messages={messages}/>
    </ToastContext.Provider>
  );
};

function useToast(): ToastContextData {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export { ToastProvider, useToast };
