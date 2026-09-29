import { useCallback, useRef, useState } from "react";

import { FiMail, FiUser, FiLock, FiArrowLeft } from "react-icons/fi";
import { FormHandles } from "@unform/core";
import { Form } from "@unform/web";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";

import { useToast } from "../../hooks/toast";
import getValidationErrors from "../../utils/getValidationErrors";

import fullLogoImg from "../../assets/full-logo.png";

import Input from "../../components/Input";
import Button from "../../components/Button";

import Turnstile, { TurnstileHandles } from "../../components/Turnstile";

import { Container, Background, Content, AnimationContainer, Honeypot } from "./styles";
import { registerUser } from "../../functions/registerUser";

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
}

const SignUp = () => {
  const formRef = useRef<FormHandles>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<TurnstileHandles>(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");

  const handleSubmit = useCallback(async (data: SignUpFormData) => {
    setIsRegistering(true);

    try {
      formRef.current?.setErrors({});

      const schema = Yup.object().shape({
        name: Yup.string()
          .required("Nome obrigatório"),
        email: Yup.string()
          .required("E-mail obrigatório")
          .email("Digite um e-mail válido"),
        password: Yup.string()
          .min(6, "Mínimo 6 dígitos"),
      });

      await schema.validate(data, {
        abortEarly: false,
      });

      if (!captchaToken) {
        setIsRegistering(false);
        addToast({
          type: "error",
          title: "Verificação necessária",
          description: "Confirme que você não é um robô.",
        });
        return;
      }

      const { name, email, password } = data;

      await registerUser({
        name,
        email,
        password,
        captchaToken,
        website: honeypotRef.current?.value || "",
      });

      setIsRegistering(false);
      navigate("/signin");

      addToast({
        type: "success",
        title: "Cadastro realizado!",
        description: "Você já pode fazer seu login no WeatherHub",
      });

    } catch (err) {
      setIsRegistering(false);

      if (err instanceof Yup.ValidationError) {
        const errors = getValidationErrors(err);
        formRef.current?.setErrors(errors);
        return;
      }

      // Captcha tokens are single use
      turnstileRef.current?.reset();

      const emailAlreadyExists = (err as { code?: string }).code === "functions/already-exists";

      addToast({
        type: "error",
        title: "Erro no cadastro",
        description: emailAlreadyExists
          ? "Este e-mail já está cadastrado."
          : "Ocorreu um erro ao fazer o cadastro. Tente novamente.",
      });
    }
  }, [addToast, navigate, captchaToken]);

  return (
    <Container>
      <Content>
        <Background>
          <h1>Junte-se a esta comunidade de apaixonados pelo clima!</h1>
        </Background>

        <AnimationContainer>
          <img src={fullLogoImg} alt="WeatherHub" width={150} />

          <Form ref={formRef} onSubmit={handleSubmit}>
            <h1>Faça seu cadastro</h1>

            <Input name='name' icon={FiUser} placeholder='Nome' />
            <Input name='email' icon={FiMail} placeholder='E-mail' />
            <Input
              name='password'
              type='password'
              icon={FiLock}
              placeholder='Senha'
            />

            <Honeypot aria-hidden='true'>
              <input ref={honeypotRef} name='website' type='text' tabIndex={-1} autoComplete='off' />
            </Honeypot>

            <Turnstile ref={turnstileRef} onTokenChange={setCaptchaToken} />

            <Button disabled={isRegistering} type='submit'>{isRegistering ? "Cadastrando..." : "Cadastrar"}</Button>
          </Form>

          <Link to="/signin">
            <FiArrowLeft />
            Voltar para Login
          </Link>
        </AnimationContainer>
      </Content>
    </Container>
  );
};

export default SignUp;
