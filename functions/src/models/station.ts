export interface StationProps {
  stationID: string;
  url: string;
  name: string;
  neighborhood: string;
  geolocation: {
    latitude: number;
    longitude: number;
  },
  softwareType: string,
}

export interface CurrentConditions {
  userId: string;
  stationID: string;
  observationTimeUTC: string,
  lastFetchUnix: number;
  order: number;
  status: "online" | "offline";
  conditions: {
    dewPoint: string;
    humidity: string;
    elevation: string;
    heatIndex: string;
    precipRate: string;
    precipTotal: string;
    pressure: string;
    temperature: string;
    windChill: string;
    windGust: string;
    windSpeed: string;
    solarRadiation: string;
    windDirection: string;
    uv: string;
  }
}

export interface HistoricConditions {
  userId: string;
  stationID: string;
  observationTimeUTC: string,
  lastFetchUnix: number;
  order: number;
  status: "online" | "offline";
  conditions: Array<{
    tempHigh: string;
    tempLow: string;
    tempAvg: string;
    windspeedHigh: string;
    windspeedLow: string;
    windspeedAvg: string;
    windgustHigh: string;
    windgustLow: string;
    windgustAvg: string;
    dewptHigh: string;
    dewptLow: string;
    dewptAvg: string;
    windchillHigh: string;
    windchillLow: string;
    windchillAvg: string;
    heatindexHigh: string;
    heatindexLow: string;
    heatindexAvg: string;
    pressureMax: string;
    pressureMin: string;
    pressureTrend: string;
    precipTotal: string;
    precipRate: string;
    solarRadiationHigh: string;
    uvHigh: string;
    winddirAvg: string;
    humidityHigh: string;
    humidityLow: string;
    humidityAvg: string;
  }>
}
