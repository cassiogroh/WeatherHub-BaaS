import React from 'react';

import Header from '../../components/Header';
import ProfileHeader from '../../components/ProfileHeader';

import { Container, InfoIds, InfoContainer } from './styles';

const Info: React.FC = () => {
  return (
    <Container>
      <Header currentPage='Dashboard' />
      <ProfileHeader currentPage='Info' />

      <InfoIds>
        <h3>Onde encontro ID's para mais estações?</h3>
        <p>Atualmente suportamos somente a busca de ID's provenientes do site <a href="https://www.wunderground.com/">wunderground.com</a>, porém estamos trabalhando para melhorar a sua experiência e trazer também outras fontes, bem como facilitar o acesso e busca a outras estações.</p>
      </InfoIds>

      <InfoContainer>
        <div>
          <h3>Temperatura</h3>
          <p>É uma grandeza física que mede a energia cinética média de todas as partículas de um sistema em equilíbrio térmico.</p>
        </div>

        <div>
          <h3>Elevação</h3>
          <p>Altitude de um ponto na superfície da terra em relação ao nível do mar.</p>
        </div>

        <div>
          <h3>Ponto de orvalho</h3>
          <p>Designa a temperatura na qual o vapor de água presente no ar ambiente passa ao estado líquido na forma de pequenas gotas por via da condensação, o chamado orvalho. Em outras palavras, é a temperatura na qual o vapor de água que está em suspensão no ar começa a se condensar.</p>
        </div>

        <div>
          <h3>Índice de calor</h3>
          <p>Visa determinar o efeito da umidade relativa sobre a temperatura aparente do ar. Em outras palavras, é uma medida para definir qual a intensidade do calor que uma pessoa sente, variando em função da temperatura e da umidade do ar. É geralmente confundido com a sensação térmica</p>
        </div>

        <div>
          <h3>Sensação térmica</h3>
          <p>Também conhecido como temperatura aparente, é a forma como os nossos sentidos percebem a temperatura do ar, e que pode diferir da temperatura real do ar estacionário seco. Tal se deve a condicionantes climatéricos que afetam a transferência de calor entre o corpo e o ar: como são a umidade, a densidade e a velocidade do vento.</p>
        </div>

        <div>
          <h3>Taxa de precipitação</h3>
          <p>Descreve a quantidade de líquido precipitado por unidade de tempo, medido geralmente em mm/h. Uma analogia simples, é relacionar este dado à precipitação de neve: com uma taxa de precipitação constante de 25 mm/h, em uma hora, teria-se 25 mm de neve depositada sobre o solo, considerando que esta não derrete no período observado.</p>
        </div>

        <div>
          <h3>Humidade relativa</h3>
          <p>É a relação entre a quantidade de água existente no ar (umidade absoluta) e a quantidade máxima que poderia haver na mesma temperatura (ponto de saturação).</p>
        </div>

        <div>
          <h3>Precipitação Total</h3>
          <p>Descreve o total de chuva precipitada em um dado período de tempo. No caso deste website, é apresentado o valor diário, sempre sendo resetado à meia noite do horário local onde a estação se encontra.</p>
        </div>

        <div>
          <h3>Rajada de vento</h3>
          <p>É um vento forte e de curta duração, geralmente de três a vinte segundos. Sua observação é feita em comparação à velocidade média do vento dentro de um período de tempo, por exemplo: se em um intervalo de dez minutos essa velocidade média foi de 33 km/h, a rajada pode ser constatada em um momento de cinco segundos em que esse vento atingiu 60 km/h ou mais.</p>
        </div>

        <div>
          <h3>Pressão atmosférica</h3>
          <p>É a pressão exercida pela atmosfera sobre a superfície do planeta. A pressão é a força exercida por unidade de área, neste caso a força exercida pelo ar em um determinado ponto da superfície. O peso normal do ar ao nível do mar é de cerca de 1 kgf/cm². Porém, a pressão atmosférica diminui com o aumento da altitude, sendo a 3000 metros, cerca de 0,7 kgf/cm², enquanto a 8840 metros, de somente 0,3 kgf/cm².</p>
        </div>
      </InfoContainer>

      <p>Fonte: <a href="https://www.wikipedia.org/" >Wikipédia</a></p>
      
    </Container>
  )
}

export default Info;