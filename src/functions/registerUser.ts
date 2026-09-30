import { callableFunction } from "../services/api";
import { cloudFunctions } from "../services/cloudFunctions";

interface RegisterUserProps {
  name: string;
  email: string;
  password: string;
  captchaToken: string;
  website: string; // honeypot
}

// Users are created server side so the captcha can't be bypassed
export async function registerUser(data: RegisterUserProps): Promise<void> {
  await callableFunction(cloudFunctions.signUp, data);
}
