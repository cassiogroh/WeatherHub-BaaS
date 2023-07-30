import React from 'react';
import { FiFrown } from 'react-icons/fi';

import Header from '../../components/Header';

import { Container, AnimationContainer } from './styles';

const NotFound: React.FC = () => {
  return (
    <Container>
      <Header currentPage='NotFound'/>
      <AnimationContainer>
          <h1>Não encontramos a página que você está procurando.</h1>
          <FiFrown size={120} />
      </AnimationContainer>
    </Container>
  )
};

export default NotFound;