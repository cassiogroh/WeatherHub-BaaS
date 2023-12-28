import { useAuth } from "../../hooks/auth";

import { Container } from "./styles";
import Link from "../Link";

const ProfileHeader = () => {
  const { signOut } = useAuth();

  return (
    <Container>
      <Link to="/dashboard" isHeaderScrollActive={false} pageName="Estações" />
      <Link to="/profile" isHeaderScrollActive={false} pageName="Perfil" />
      <Link to="/info" isHeaderScrollActive={false} pageName="Info" />
      <Link to="/" isHeaderScrollActive={false} pageName="Sair" onClick={signOut} />
    </Container>
  )
}

export default ProfileHeader;
