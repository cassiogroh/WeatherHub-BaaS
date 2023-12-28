import { FiFrown } from "react-icons/fi";

import Header from "../../components/Header";

import { Container, AnimationContainer } from "./styles";

const NotFound = () => {
  return (
    <Container>
      <Header />
      <AnimationContainer>
        <h1>Não encontramos a página que você está procurando.</h1>
        <FiFrown size={120} />
      </AnimationContainer>
    </Container>
  )
};

export default NotFound;
