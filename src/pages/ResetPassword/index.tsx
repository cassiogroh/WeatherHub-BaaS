import { useRef, useCallback, useState } from "react";
import { FiMail, FiArrowLeft } from "react-icons/fi";
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

interface ResetPasswordFormData {
  email: string;
}

const ResetPassword = () => {
  const formRef = useRef<FormHandles>(null);

  const { sendResetPasswordEmail } = useAuth();
  const { addToast } = useToast();

  const [isSendingRecoverEmail, setIsSendingRecoverEmail] = useState(false);

  const navigate = useNavigate();

  const handleSubmit= useCallback(async (data: ResetPasswordFormData) => {
    setIsSendingRecoverEmail(true);

    try {
      formRef.current?.setErrors({});

      const schema = Yup.object().shape({
        email: Yup.string()
          .required("E-mail obrigatório")
          .email("Digite um e-mail válido"),
      });

      await schema.validate(data, {
        abortEarly: false,
      });

      await sendResetPasswordEmail(data.email);

      addToast({
        type: "success",
        title: "E-mail de recuperação enviado!",
        description: "Verifique sua caixa de entrada ou de spam para encontrar o link de recuperação da sua senha.",
        timeout: 10000,
      });

      setIsSendingRecoverEmail(false);
      navigate("/signin");
    } catch (err) {
      setIsSendingRecoverEmail(false);

      if (err instanceof Yup.ValidationError) {
        const errors = getValidationErrors(err);
        formRef.current?.setErrors(errors);

        return;
      }

      addToast({
        type: "error",
        title: "Ocorreu um erro",
        description: "Certifique-se de que o e-mail está correto e tente novamente.",
      });
    }
  }, [sendResetPasswordEmail, addToast, navigate]);

  return (
    <Container>
      <Content>
        <AnimationContainer>
          <img src={logoImg} alt="WeatherHub" width={150} />

          <Form ref={formRef} onSubmit={handleSubmit}>
            <h1>Resete sua senha</h1>

            <Input name='email' icon={FiMail} placeholder='E-mail' />

            <Button disabled={isSendingRecoverEmail} type='submit'>{isSendingRecoverEmail ? "Enviando e-mail..." : "Resetar senha"}</Button>
          </Form>

          <Link to="/signin">
            <FiArrowLeft />
            Voltar para Login
          </Link>
        </AnimationContainer>

        <Background>
          <h1>Recupere sua conta e veja seu dashboard novamente!</h1>
        </Background>
      </Content>
    </Container>
  );
};

export default ResetPassword;
