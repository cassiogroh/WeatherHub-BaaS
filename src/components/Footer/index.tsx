import { Container } from "./styles";

import logoImg from "../../assets/logo.png";

const Footer = () => {
  const currentYear =  new Date().getFullYear();

  return (
    <Container>
      <p>©WeatherHub</p>
      <p>{currentYear}</p>
      <img src={logoImg} alt="WeatherHub"/>
    </Container>
  );
};

export default Footer;
