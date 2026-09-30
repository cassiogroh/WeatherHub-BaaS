import { HistoricConditions, HistoricConditionsData } from "../models/station";

// Stations of the spreadsheet, in its column order. This order must not change:
// the copied text is pasted straight into the sheet.
export const COPY_STATIONS_IDS = [
  "ISANTACA56", // Brusque - Rio Branco
  "IBRUSQ14", // Brusque - Santa Luzia
  "ISANTACA85", // Brusque - Centro
  "IBRUSQUE2", // Brusque - Tomaz Coelho
  "IBRUSQ26", // Brusque - Santa Terezinha
  "IBRUSQ25", // Brusque - Limeira Alta
  "ISCGUABI2", // Guabiruba - Aymoré
  "IGUABIRU6", // Guabiruba - Planície Alta
  "IBOTUV2", // Botuverá - Gabiroba
  "IPRESI11", // Presidente Nereu - Tirivas
  "ISCVARGE2", // Vidal Ramos - Faz. Rio Bonito 1
  "ISCVARGE3", // Vidal Ramos - Faz. Rio Bonito 2
];

interface DataInfo {
  low: string | number;
  max: string | number;
  prec: string | number;
}

interface CopyDataProps {
  historicConditions: HistoricConditions[]; // any loaded stations, in any order
  currentHistoricDay: number;
}

const writeToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers without the Clipboard API
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(dummy);
    return copied;
  }
};

export const copyHistoricData = async ({
  historicConditions,
  currentHistoricDay,
}: CopyDataProps) => {
  const stationsById = new Map(historicConditions.map(station => [station.stationId, station]));
  const missingIds: string[] = [];

  // Built fresh on every copy, always in the spreadsheet order
  const d: DataInfo[] = COPY_STATIONS_IDS.map(stationId => {
    const conditions = stationsById.get(stationId)?.conditions || ([] as HistoricConditionsData[]);
    const conditionsOnDay = conditions[currentHistoricDay + 6];

    // Station not in the account, or no summary for that day: empty columns keep the others aligned
    if (!conditionsOnDay || conditionsOnDay.tempLow === undefined) {
      missingIds.push(stationId);

      return {
        low: "",
        max: "",
        prec: "",
      };
    }

    return {
      low: String(conditionsOnDay.tempLow).replace(/\./g, ","),
      max: String(conditionsOnDay.tempHigh).replace(/\./g, ","),
      prec:
        Number(conditionsOnDay.precipTotal) === 0
          ? ""
          : String(conditionsOnDay.precipTotal).replace(/\./g, ","),
    };
  });

  const formattedData = `${d[0].low};${d[0].max};;${d[0].prec};;;${d[1].low};${d[1].max};;${d[1].prec};;;${d[2].low};${d[2].max};;${d[2].prec};;;${d[3].low};${d[3].max};;${d[3].prec};;;${d[4].low};${d[4].max};;${d[4].prec};;;${d[5].low};${d[5].max};;${d[5].prec};;;;;;;;${d[6].low};${d[6].max};;${d[6].prec};;;${d[7].low};${d[7].max};;${d[7].prec};;;;;;;;${d[8].low};${d[8].max};;${d[8].prec};;;;;${d[9].low};${d[9].max};;${d[9].prec};;;;;${d[10].low};${d[10].max};;${d[10].prec};;;${d[11].low};${d[11].max};;${d[11].prec}`;

  const copied = await writeToClipboard(formattedData);

  return { copied, missingIds };
};
