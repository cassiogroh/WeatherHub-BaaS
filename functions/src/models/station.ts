export interface StationProps {
  name: string;
  neighborhood: string;
  stationID: string;
  url: string;
  dewpt: number;
  humidity: number;
  elev: number;
  heatIndex: number;
  precipRate: number;
  precipTotal: number;
  pressure: number;
  temp: number;
  windChill: number;
  windGust: number;
  windSpeed: number;
  status: 'online' | 'offline';

  humidityHigh: number | string;
  humidityLow: number | string;
  humidityAvg: number | string;
  tempHigh: number | string;
  tempLow: number | string;
  tempAvg: number | string;
  windspeedHigh: number | string;
  windspeedLow: number | string;
  windspeedAvg: number | string;
  windgustHigh: number | string;
  windgustLow: number | string;
  windgustAvg: number | string;
  dewptHigh: number | string;
  dewptLow: number | string;
  dewptAvg: number | string;
  windchillHigh: number | string;
  windchillLow: number | string;
  windchillAvg: number | string;
  heatindexHigh: number | string;
  heatindexLow: number | string;
  heatindexAvg: number | string;
  pressureMax: number | string;
  pressureMin: number | string;
  precipTotalHistoric: number | string;
}

export interface StationCurrentProps {
  status: 'online' | 'offline';
  stationID: string;
  name: string;
  url: string;
  neighborhood?: string;
  dewpt?: number;
  humidity?: number;
  elev?: number;
  heatIndex?: number;
  precipRate?: number;
  precipTotal?: number;
  pressure?: number;
  temp?: number;
  windChill?: number;
  windGust?: number;
  windSpeed?: number;
}

export interface StationHistoricProps {
  humidityHigh: number | string;
  humidityLow: number | string;
  humidityAvg: number | string;
  tempHigh: number | string;
  tempLow: number | string;
  tempAvg: number | string;
  windspeedHigh: number | string;
  windspeedLow: number | string;
  windspeedAvg: number | string;
  windgustHigh: number | string;
  windgustLow: number | string;
  windgustAvg: number | string;
  dewptHigh: number | string;
  dewptLow: number | string;
  dewptAvg: number | string;
  windchillHigh: number | string;
  windchillLow: number | string;
  windchillAvg: number | string;
  heatindexHigh: number | string;
  heatindexLow: number | string;
  heatindexAvg: number | string;
  pressureMax: number | string;
  pressureMin: number | string;
  pressureTrend: number | string;
  precipTotalHistoric: number | string;
}