import { FormHandles } from "@unform/core";
import { Form } from "@unform/web";
import { useCallback, useMemo, useRef, useState } from "react";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import * as Yup from "yup";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import Header from "../../components/Header";
import ProfileHeader from "../../components/ProfileHeader";
import Button from "../../components/Button";
import Input from "../../components/Input";

import { useAuth } from "../../hooks/auth";
import { useToast } from "../../hooks/toast";
import getValidationErrors from "../../utils/getValidationErrors";

import { Container, Content } from "./styles";
import { callableFunction } from "../../services/api";
import { signIntoFirebase } from "../../functions/signIn";

interface ProfileFormData {
  name: string;
  email: string;
  old_password: string;
  password: string;
  password_confirmation: string;
}

const Profile = () => {
  const formRef = useRef<FormHandles>(null);
  const { addToast } = useToast();
  const { user, updateUser } = useAuth();

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleSubmit = useCallback(async (data: ProfileFormData) => {
    try {
      formRef.current?.setErrors({});

      const schema = Yup.object().shape({
        name: Yup.string()
          .required("Nome obrigatório"),
        email: Yup.string()
          .required("E-mail obrigatório")
          .email("Digite um e-mail válido"),
        old_password: Yup.string(),
        password: Yup.string().when("old_password", {
          is: val => !!val.length,
          then: Yup.string().min(6, "Mínimo 6 dígitos").required("Campo obrigatório"),
          otherwise: Yup.string(),
        }),
        password_confirmation: Yup.string()
          .when("old_password", {
            is: val => !!val.length,
            then: Yup.string().min(6, "Mínimo 6 dígitos").required("Campo obrigatório"),
            otherwise: Yup.string(),
          })
          .oneOf([Yup.ref("password")], "Confirmação incorreta"),
      });

      await schema.validate(data, {
        abortEarly: false,
      });

      const { name, email, old_password, password, password_confirmation } = data;

      const formData = {
        userId: user.userId,
        name,
        email,
        ...(old_password
          ? {
            old_password,
            password,
            password_confirmation,
          }
          : {}),
      };

      setIsUpdatingProfile(true);
      if (old_password) {
        try {
          await signIntoFirebase(user.email, old_password);
        } catch (err) {
          addToast({
            type: "error",
            title: "Senha atual incorreta.",
            description: "Tente novamente.",
          });
          setIsUpdatingProfile(false);
          return;
        }
      }

      await callableFunction("updateProfile", formData);

      const mockUser = { ...user };

      mockUser.name = name;
      mockUser.email = email;

      updateUser(mockUser);

      addToast({
        type: "success",
        title: "Perfil atualizado!",
      });

    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const errors = getValidationErrors(err);
        formRef.current?.setErrors(errors);
        return;
      }

      addToast({
        type: "error",
        title: "Erro na atualização do perfil.",
        description: "Tente novamente.",
      });
    }

    setIsUpdatingProfile(false);
  }, [addToast, updateUser, user]);

  const user_since = useMemo(() => {
    if (!user.created_at) return "";

    const date = format(
      new Date(user.created_at),
      "dd '/' MMM '/' yyyy",
      { locale: ptBR },
    );

    return date;
  }, [user]);

  return (
    <Container>
      <Header />
      <ProfileHeader />

      <Content>
        <Form
          ref={formRef}
          initialData={{
            name: user.name,
            email: user.email,
          }}
          onSubmit={handleSubmit}
        >

          <Input name='name' icon={FiUser} placeholder='Nome' />
          <Input name='email' icon={FiMail} placeholder='E-mail' />

          <Input
            autoComplete="new-password"
            containerStyle={{ marginTop: 24 }}
            name='old_password'
            icon={FiLock}
            type='password'
            placeholder='Senha atual'
          />

          <Input
            name='password'
            icon={FiLock}
            type='password'
            placeholder='Nova senha'
          />

          <Input
            name='password_confirmation'
            icon={FiLock}
            type='password'
            placeholder='Confirmar senha'
          />

          <Button disabled={isUpdatingProfile} type='submit'>{isUpdatingProfile ? "Atualizando perfil..." : "Confirmar alterações"}</Button>
        </Form>
        <p>Conta criada em: {user_since}</p>
      </Content>
    </Container>
  );
};

export default Profile;
