import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Container } from './styles';

export interface DaylyForecast {
  dayOfWeek: string;
  temperatureMin: number;
  temperatureMax: number;
  narrative: string;
  sunriseTimeLocal: string;
  sunsetTimeLocal: string;
  moonPhase: string;
  temperature: Array<number>;
  precipChance: Array<number>;
  iconCode: Array<number>;
  windPhrase: Array<string>;
}

export interface ForecastToday {
  dayOfWeek: string;
  dayOrNight: string;
  iconCode: number;
  daypartName: string;
  temperature: number;
  temperatureHeatIndex: number;
  temperatureWindChill: number;
  relativeHumidity: number;
  precipChance: number;
  expectedRain: number;
  windPhrase: string;
  temperatureMin: number;
  temperatureMax: number;
  sunriseTimeLocal: string;
  sunsetTimeLocal: string;
  moonPhase: string;
  narrative: string;
}

interface Request {
  daylyForecast: DaylyForecast;
}

const ForecastCard: React.FC<Request> = ({ daylyForecast }: Request) => {
  const sunRiseTime = useMemo(() => {
    const formattedSunRiseTime = format(
      new Date(daylyForecast.sunriseTimeLocal),
      `HH':'mm' h'`,
      { locale: ptBR }
    );

    return formattedSunRiseTime;
  }, [daylyForecast.sunriseTimeLocal]);

  const sunsetTime = useMemo(() => {
    const formattedSunsetTime = format(
      new Date(daylyForecast.sunsetTimeLocal),
      `HH':'mm' h'`,
      { locale: ptBR }
    );

    return formattedSunsetTime
  }, [daylyForecast.sunsetTimeLocal]);

  const currentDay = useMemo(() => {
    const formattedCurrentDay = format(
      new Date(daylyForecast.sunsetTimeLocal),
      `dd '/' MMM`,
      { locale: ptBR }
    );

    return formattedCurrentDay
  }, [daylyForecast.sunsetTimeLocal]);

  return (
    <Container >
      <h2>{daylyForecast.dayOfWeek}, {currentDay}</h2>
      <main>
        <div>
          <img src={require(`../../assets/png-icons/${('0' + daylyForecast.iconCode[0]).slice(-2)}.png`)} alt="Forecast icon"/>
          <h3>Dia</h3>
          <p>Temperatura: {daylyForecast.temperature[0]} °C</p>
          <p>{daylyForecast.windPhrase[0]}</p>
          <p>Chance de chuva: {daylyForecast.precipChance[0]} %</p>
        </div>

        <div>
          <img src={require(`../../assets/png-icons/${('0' + daylyForecast.iconCode[1]).slice(-2)}.png`)} alt="Forecast icon"/>
          <h3>Noite</h3>
          <p>Temperatura: {daylyForecast.temperature[1]} °C</p>
          <p>{daylyForecast.windPhrase[1]}</p>
          <p>Chance de chuva: {daylyForecast.precipChance[1]} %</p>
        </div>
      </main>

      <h4>{daylyForecast.narrative}</h4>
      {/* <p>{daylyForecast.moonPhase}</p> */}
      <footer>
        <div>
          <p>Nascer do sol<span>{sunRiseTime}</span></p>
          <p>Pôr do sol<span>{sunsetTime}</span></p>
        </div>

        <div>
          <p>Mínima<span>{daylyForecast.temperatureMin} °C</span></p>
          <p>Máxima<span>{daylyForecast.temperatureMax} °C</span></p>
        </div>
      </footer>
    </Container>
  )
}

export default ForecastCard;