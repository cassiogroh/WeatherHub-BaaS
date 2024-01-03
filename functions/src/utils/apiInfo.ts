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
    // 'IBRUSQ12',
    // 'ISCGUABI2',
    // 'IGUABIRU5',
    // 'IGUABIRU6',
    // 'ISCRIBEI2',
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

// ISANTACA85 - Brusque - Centro
// ISANTACA56 - Brusque - Rio Branco
// IBRUSQUE2  - Brusque - Tomaz Coelho
// IBRUSQ14   - Brusque - Santa Luzia
// IBRUSQ12   - Brusque - Cristalina
// IGUABIRU2  - Guabiruba - Aymoré
// IGUABIRU5  - Guabiruba - Lageado Alto
// IGUABIRU6  - Guabiruba - Planície Alta
// ISCRIBEI2  - Botuverá - Ourinhos
// IPRESI11   - Presidente Nereu - Tirivas
// ISCVARGE2  - Vidal Ramos - Faz. Rio Bonito 1
// ISCPRESI3  - Vidal Ramos - Faz. Rio Bonito 2
