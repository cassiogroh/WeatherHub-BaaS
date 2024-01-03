import { CurrentApiResponse } from "../../getCurrentConditions";
import { CurrentConditions } from "../../models/station";

export function formatValue(value: number | null): string {
  return value || value === 0 ? value.toFixed(1) : "--";
}

interface BuildCurrentConditions {
  currentConditions: CurrentApiResponse;
  lastFetchUnix: number;
}

export const buildCurrentConditions = ({
  currentConditions,
  lastFetchUnix,
}: BuildCurrentConditions): CurrentConditions => {
  const observations = currentConditions.observations[0];

  const {
    stationID,
    obsTimeUtc,
    neighborhood,
    softwareType,
    country,
    metric,
  } = observations;

  const station: CurrentConditions = {
    stationId: stationID,
    neighborhood,
    softwareType,
    country,
    observationTimeUTC: obsTimeUtc,
    geolocation: {
      latitude: observations.lat,
      longitude: observations.lon,
    },
    conditions: {
      dewPoint: formatValue(metric.dewpt),
      elevation: formatValue(metric.elev),
      heatIndex: formatValue(metric.heatIndex),
      precipRate: formatValue(metric.precipRate),
      precipTotal: formatValue(metric.precipTotal),
      pressure: formatValue(metric.pressure),
      temperature: formatValue(metric.temp),
      windChill: formatValue(metric.windChill),
      windGust: formatValue(metric.windGust),
      windSpeed: formatValue(metric.windSpeed),
      humidity: formatValue(observations.humidity),
      solarRadiation: formatValue(observations.solarRadiation),
      windDirection: formatValue(observations.winddir),
      uv: formatValue(observations.uv),
    },
    lastFetchUnix,
    status: "online",
    url: `https://www.wunderground.com/dashboard/pws/${stationID}`,
  };

  return station;
};
