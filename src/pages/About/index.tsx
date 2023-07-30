import React from 'react';

import Header from '../../components/Header';

import { Container, Background, AnimationContainer } from './styles';

const About: React.FC = () => {
  return (
    <Container>
      <Header currentPage='Sobre'/>
      <AnimationContainer>
          <h1>Quem somos?</h1>

          <br/>

          <p>Nascemos da vontade de oferecer às pessoas que gostam de acompanhar informações do clima
            uma maneira mais fácil de fazê-lo. Diariamente, vários amantes do tempo e até mesmo profissionais 
            trabalham duro para coletar dados de diferentes fontes e colocá-los em ordem, principalmente no que se refere aos
            valores extremos de algumas propriedades atmosféricas.
          </p>

          <br/>

          <p>Com o ©WeatherHub, fica muito mais fácil monitorar sua rede de estações ou acompanhar o clima
            em determinada região. Com todas as suas estações meteorológicas preferidas, juntinhas, em um
            só lugar, é possível identificar rapidinho onde está chovendo, ou onde as temperaturas
            estão despencando.
          </p>
      </AnimationContainer>

      <Background />
    </Container>
  )
};

export default About;