import { HistoricConditions, HistoricConditionsData } from "../models/station";

interface DataInfo {
  low: string | number;
  max: string | number;
  prec: string | number;
}
const d: DataInfo[] = [] as DataInfo[];

interface CopyDataProps {
  historicConditions: HistoricConditions[];
  currentHistoricDay: number;
}

export const copyHistoricData = ({
  historicConditions,
  currentHistoricDay,
}: CopyDataProps) => {
  historicConditions.forEach((stationData) => {
    const conditions =
      stationData.conditions || ([] as HistoricConditionsData[]);
    const conditionsOnDay = conditions[currentHistoricDay + 6];

    if (!conditionsOnDay) {
      d.push({
        low: "",
        max: "",
        prec: "",
      });
    } else {
      d.push({
        low: String(conditionsOnDay.tempLow).replace(/\./g, ","),
        max: String(conditionsOnDay.tempHigh).replace(/\./g, ","),
        prec:
          Number(conditionsOnDay.precipTotal) === 0
            ? ""
            : String(conditionsOnDay.precipTotal).replace(/\./g, ","),
      });
    }
  });

  let formattedData = "";

  if (d.length >= 12)
    formattedData = `${d[0].low};${d[0].max};;${d[0].prec};;;${d[1].low};${d[1].max};;${d[1].prec};;;${d[2].low};${d[2].max};;${d[2].prec};;;${d[3].low};${d[3].max};;${d[3].prec};;;${d[4].low};${d[4].max};;${d[4].prec};;;${d[5].low};${d[5].max};;${d[5].prec};;;;;;;;${d[6].low};${d[6].max};;${d[6].prec};;;${d[7].low};${d[7].max};;${d[7].prec};;;;;;;;${d[8].low};${d[8].max};;${d[8].prec};;;;;${d[9].low};${d[9].max};;${d[9].prec};;;;;${d[10].low};${d[10].max};;${d[10].prec};;;${d[11].low};${d[11].max};;${d[11].prec}`;

  const dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.value = formattedData;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);

  return d.length >= 12 ? true : false;
};
