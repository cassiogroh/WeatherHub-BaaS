export const apiInfo = {
  // apiKey: process.env.WU_API_KEY,
  apiKey: "5ab387f9a952492eb387f9a952392ec0",
  units: "m", // Metric system (switch to 'e' for imperial system)
  numericPreicison: "decimal",
  language: "pt-BR",
  stationsId: [
    // 'ISANTACA85',
    // 'ISANTACA56',
    // 'IBRUSQUE2',
    // 'IBRUSQ14',
    // 'IBRUSQ25',
    // 'IBRUSQ26',
    // 'ISCGUABI2',
    // 'IGUABIRU6',
    // 'IBOTUV2',
    // 'IPRESI11',
    // 'ISCVARGE2',
    // 'ISCVARGE3',
    // 'IBRUSQ17', // Test only (station deactivated)
  ],
};

export function getCurrentConditionsUrl( stationId: string, apiKey: string): string {
  const url = `https://api.weather.com/v2/pws/observations/current?stationId=${stationId}&format=json&units=${apiInfo.units}&apiKey=${apiKey}&numericPrecision=${apiInfo.numericPreicison}`;
  return url;
}

export function getHistoricUrl( stationId: string, apiKey: string): string {
  const url = `https://api.weather.com/v2/pws/dailysummary/7day?stationId=${stationId}&format=json&units=${apiInfo.units}&apiKey=${apiKey}&numericPrecision=${apiInfo.numericPreicison}`;
  return url;
}

export function getGeoCodeUrl( latitude: number, longitude: number, apiKey: string): string {
  const url = `https://api.weather.com/v3/wx/forecast/daily/5day?geocode=${latitude},${longitude}&format=json&units=${apiInfo.units}&language=${apiInfo.language}&apiKey=${apiKey}`;
  return url;
}

// ESTAÇÕES

// ISANTACA56 - Brusque - Rio Branco
// IBRUSQ14   - Brusque - Santa Luzia
// ISANTACA85 - Brusque - Centro
// IBRUSQUE2  - Brusque - Tomaz Coelho
// IBRUSQ26   - Brusque - Santa Terezinha
// IBRUSQ25   - Brusque - Limeira Alta
// ISCGUABI2  - Guabiruba - Aymoré
// IGUABIRU6  - Guabiruba - Planície Alta
// IBOTUV2    - Botuverá - Gabiroba
// IPRESI11   - Presidente Nereu - Tirivas
// ISCVARGE2  - Vidal Ramos - Faz. Rio Bonito 1
// ISCVARGE3  - Vidal Ramos - Faz. Rio Bonito 2
