import { onCall } from "firebase-functions/v2/https";
import { getGeoCodeUrl } from "./utils/apiInfo";

interface DaylyForecast {
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

interface ForecastToday {
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
  temperatureMax: number | null;
  sunriseTimeLocal: string;
  sunsetTimeLocal: string;
  moonPhase: string;
  narrative: string;
}

interface RequestProps {
  latitude: number;
  longitude: number;
}

export const getForecastFunction = onCall(async (request) => {
  const { latitude, longitude }: RequestProps = request.data;

  const url = getGeoCodeUrl(latitude, longitude);

  const response = await fetch(url).then((response) => response.json());

  const {
    dayOfWeek,
    temperatureMin,
    temperatureMax,
    narrative,
    sunriseTimeLocal,
    sunsetTimeLocal,
    moonPhase,
  } = response;

  const dayPart = response.daypart;

  const {
    iconCode,
    dayOrNight,
    daypartName,
    temperature,
    temperatureHeatIndex,
    temperatureWindChill,
    relativeHumidity,
    precipChance,
    qpf,
    windPhrase,
  } = dayPart ? dayPart[0] : {} as ForecastToday

  const forecastToday: ForecastToday = {} as ForecastToday;
  const daylyForecast: object[] = [];

  forecastToday.dayOfWeek = dayOfWeek[0];
  forecastToday.dayOrNight = dayOrNight[0] === null ? dayOrNight[1] : dayOrNight[0];
  forecastToday.iconCode = iconCode[0] === null ? iconCode[1] : iconCode[0];
  forecastToday.daypartName = daypartName[0] === null ? daypartName[1] : daypartName[0];
  forecastToday.temperature = temperature[0] === null ? temperature[1] : temperature[0];
  forecastToday.temperatureHeatIndex = temperatureHeatIndex[0] === null ? temperatureHeatIndex[1] : temperatureHeatIndex[0];
  forecastToday.temperatureWindChill = temperatureWindChill[0] === null ? temperatureWindChill[1] : temperatureWindChill[0];
  forecastToday.relativeHumidity = relativeHumidity[0] === null ? relativeHumidity[1] : relativeHumidity[0];
  forecastToday.precipChance = precipChance[0] === null ? precipChance[1] : precipChance[0];
  forecastToday.expectedRain = qpf[0] === null ? qpf[1] : qpf[0];
  forecastToday.windPhrase = windPhrase[0] === null ? windPhrase[1] : windPhrase[0];
  forecastToday.temperatureMin = temperatureMin[0];
  forecastToday.temperatureMax = temperatureMax[0] ? temperatureMax[0] : null;
  forecastToday.sunriseTimeLocal = sunriseTimeLocal[0];
  forecastToday.sunsetTimeLocal = sunsetTimeLocal[0];
  forecastToday.moonPhase = moonPhase[0];
  forecastToday.narrative = narrative[0];

  for (let i = 1; i < 5; i++) {
    const daylyForecastObject: DaylyForecast = {} as DaylyForecast;

    daylyForecastObject.temperatureMin = temperatureMin[i];
    daylyForecastObject.temperatureMax = temperatureMax[i];
    daylyForecastObject.dayOfWeek = dayOfWeek[i];
    daylyForecastObject.narrative = narrative[i];
    daylyForecastObject.moonPhase = moonPhase[i];
    daylyForecastObject.sunriseTimeLocal = sunriseTimeLocal[i];
    daylyForecastObject.sunsetTimeLocal = sunsetTimeLocal[i];
    daylyForecastObject.temperature = [temperature[2*i], temperature[2*i+1]];
    daylyForecastObject.iconCode = [iconCode[2*i], iconCode[2*i+1]];
    daylyForecastObject.windPhrase = [windPhrase[2*i], windPhrase[2*i+1]];
    daylyForecastObject.precipChance = [precipChance[2*i], precipChance[2*i+1]];

    daylyForecast.push(daylyForecastObject);
  }

  return { forecastToday, daylyForecast };
});
