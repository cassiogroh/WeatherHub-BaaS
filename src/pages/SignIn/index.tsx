import { useRef, useCallback, useState } from "react";
import { FiLogIn, FiMail, FiLock } from "react-icons/fi";
import { FormHandles } from "@unform/core";
import { Form } from "@unform/web";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/auth";
import { useToast } from "../../hooks/toast";
import getValidationErrors from "../../utils/getValidationErrors";

import logoImg from "../../assets/full-logo.png";

import Input from "../../components/Input";
import Button from "../../components/Button";

import { Container, Content, AnimationContainer, Background } from "./styles";

interface SignInFormData {
  email: string;
  password: string;
}

const SignIn = () => {
  const formRef = useRef<FormHandles>(null);

  const { signIn } = useAuth();
  const { addToast } = useToast();

  const [isSigningIn, setIsSigningIn] = useState(false);

  const navigate = useNavigate();

  const handleSubmit= useCallback(async (data: SignInFormData) => {
    setIsSigningIn(true);

    try {
      formRef.current?.setErrors({});

      const schema = Yup.object().shape({
        email: Yup.string()
          .required("E-mail obrigatório")
          .email("Digite um e-mail válido"),
        password: Yup.string()
          .required("Senha obrigatória"),
      });

      await schema.validate(data, {
        abortEarly: false,
      });

      await signIn({
        email: data.email,
        password: data.password,
      });

      setIsSigningIn(false);
      navigate("/dashboard");
    } catch (err) {
      setIsSigningIn(false);

      if (err instanceof Yup.ValidationError) {
        const errors = getValidationErrors(err);
        formRef.current?.setErrors(errors);

        return;
      }

      addToast({
        type: "error",
        title: "Erro na autenticação",
        description: "Ocorreu um erro ao fazer login. Cheque suas credenciais e tente novamente.",
      });
    }
  }, [signIn, addToast, navigate]);

  return (
    <Container>
      <Content>
        <AnimationContainer>
          <img src={logoImg} alt="WeatherHub" width={150} />

          <Form ref={formRef} onSubmit={handleSubmit}>
            <h1>Faça seu login</h1>

            <Input name='email' icon={FiMail} placeholder='E-mail' />
            <Input
              name='password'
              icon={FiLock}
              type='password'
              placeholder='Senha'
            />

            <Button disabled={isSigningIn} type='submit'>{isSigningIn ? "Entrando..." : "Entrar"}</Button>

            {/* <a href="forgot">Esqueci minha senha</a> */}
          </Form>

          <Link to="/signup">
            <FiLogIn />
            Criar conta
          </Link>
        </AnimationContainer>

        <Background>
          <h1>Faça login e entre nessa tempestade de informações!</h1>
        </Background>
      </Content>
    </Container>
  );
};

export default SignIn;
