import { Container } from "./styles";

import logoImg from "../../assets/logo.png";

const Footer = () => {
  const currentYear =  new Date().getFullYear();

  return (
    <Container>
      <p>
        <a href={import.meta.env.VITE_APP_URL}>©WeatherHub</a>
        {currentYear}
        <img src={logoImg} alt="WeatherHub"/>
      </p>
    </Container>
  );
};

export default Footer;
