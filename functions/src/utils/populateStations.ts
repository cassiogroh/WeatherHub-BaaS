import { getDate, getMonth, getYear, isAfter, subDays } from "date-fns";
import { StationProps } from "../models/station";
import { UrlArray } from "../loadStations";
import { apiInfo } from "./api_info";
import { User } from "../models/user";

interface RequestProps {
  urlArray: Array<UrlArray>;
  user: User;
}

export const populateStations = (async ({ urlArray }: RequestProps) => {
  const unitSystem = apiInfo.units === "m" ? "metric" : "imperial";

  const isQuarterAfterMidnight = () => {
    const now = Date.now();
    const quarterAfterMidnight = new Date(getYear(now), getMonth(now), getDate(now), 0, 15, 0);
    return isAfter(now, quarterAfterMidnight);
  };

  let stationsHistoricData = null;
  isQuarterAfterMidnight() &&
  (
    stationsHistoricData = await Promise.allSettled(
      urlArray.map((urls) =>
        fetch(urls.urlHistoric)
          .then(response => {return response.json();})
          .catch(err => console.log("Error fetching historic data: ", err)),
      ),
    )
  );

  const stationsHistoric: object[] = [];

  if (isQuarterAfterMidnight() && stationsHistoricData) {
    stationsHistoricData.forEach(data => {
      const station: StationProps[] = [] as StationProps[];

      if (data.status === "fulfilled" && isNaN(data.value) && data.value) {

        const indexToReplace: number[] = [];
        const seven_days_ago = subDays(new Date(), 6);

        if (data.value.summaries.length < 7) {
          for (let i = 0; i < data.value.summaries.length - 1; i++) {
            const date1 = new Date(data.value.summaries[i].obsTimeLocal).getDate();
            const date2 = new Date(data.value.summaries[i + 1].obsTimeLocal).getDate();

            if (date2 > date1 + 1) {
              indexToReplace.push(i+1);
            }
          }
        }

        if (new Date(data.value.summaries[0].obsTimeLocal).getDate() !== seven_days_ago.getDate()) {
          indexToReplace.push(0);
        }

        if (new Date(data.value.summaries[data.value.summaries.length - 1].obsTimeLocal).getDate() !== new Date().getDate()) {
          indexToReplace.push(7);
        }

        indexToReplace.length &&
        indexToReplace.forEach(index => {
          data.value.summaries.splice(index, 0, {
            humidityAvg: null,
            humidityHigh: null,
            humidityLow: null,
            metric: {
              dewptAvg: null,
              dewptHigh: null,
              dewptLow: null,
              heatindexAvg: null,
              heatindexHigh: null,
              heatindexLow: null,
              precipRate: null,
              precipTotal: null,
              pressureMax: null,
              pressureMin: null,
              pressureTrend: null,
              tempAvg: null,
              tempHigh: null,
              tempLow: null,
              windchillAvg: null,
              windchillHigh: null,
              windchillLow: null,
              windgustAvg: null,
              windgustHigh: null,
              windgustLow: null,
              windspeedAvg: null,
              windspeedHigh: null,
              windspeedLow: null,
            },
          });
        });

        data.value.summaries.forEach((historicData: any) => {
          const stationHistoric: StationProps = {} as StationProps;

          const {
            tempHigh,
            tempLow,
            tempAvg,
            windspeedHigh,
            windspeedLow,
            windspeedAvg,
            windgustHigh,
            windgustLow,
            windgustAvg,
            dewptHigh,
            dewptLow,
            dewptAvg,
            windchillHigh,
            windchillLow,
            windchillAvg,
            heatindexHigh,
            heatindexLow,
            heatindexAvg,
            pressureMax,
            pressureMin,
            precipTotal,
          }
          = historicData[unitSystem];

          const {
            humidityLow,
            humidityAvg,
            humidityHigh,
          } = historicData;

          stationHistoric.humidityHigh = humidityHigh || humidityHigh === 0 ? humidityHigh.toFixed(1) : "";
          stationHistoric.humidityLow = humidityLow || humidityLow === 0 ? humidityLow.toFixed(1) : "";
          stationHistoric.humidityAvg = humidityAvg || humidityAvg === 0 ? humidityAvg.toFixed(1) : "";
          stationHistoric.tempHigh = tempHigh || tempHigh === 0 ? tempHigh.toFixed(1) : "";
          stationHistoric.tempLow = tempLow || tempLow === 0 ? tempLow.toFixed(1) : "";
          stationHistoric.tempAvg = tempAvg || tempAvg === 0 ? tempAvg.toFixed(1) : "";
          stationHistoric.windspeedHigh = windspeedHigh || windspeedHigh === 0 ? windspeedHigh.toFixed(1) : "";
          stationHistoric.windspeedLow = windspeedLow || windspeedLow === 0 ? windspeedLow.toFixed(1) : "";
          stationHistoric.windspeedAvg = windspeedAvg || windspeedAvg === 0 ? windspeedAvg.toFixed(1) : "";
          stationHistoric.windgustHigh = windgustHigh || windgustHigh === 0 ? windgustHigh.toFixed(1) : "";
          stationHistoric.windgustLow = windgustLow || windgustLow === 0 ? windgustLow.toFixed(1) : "";
          stationHistoric.windgustAvg = windgustAvg || windgustAvg === 0 ? windgustAvg.toFixed(1) : "";
          stationHistoric.dewptHigh = dewptHigh || dewptHigh === 0 ? dewptHigh.toFixed(1) : "";
          stationHistoric.dewptLow = dewptLow || dewptLow === 0 ? dewptLow.toFixed(1) : "";
          stationHistoric.dewptAvg = dewptAvg || dewptAvg === 0 ? dewptAvg.toFixed(1) : "";
          stationHistoric.windchillHigh = windchillHigh || windchillHigh === 0 ? windchillHigh.toFixed(1) : "";
          stationHistoric.windchillLow = windchillLow || windchillLow === 0 ? windchillLow.toFixed(1) : "";
          stationHistoric.windchillAvg = windchillAvg || windchillAvg === 0 ? windchillAvg.toFixed(1) : "";
          stationHistoric.heatindexHigh = heatindexHigh || heatindexHigh === 0 ? heatindexHigh.toFixed(1) : "";
          stationHistoric.heatindexLow = heatindexLow || heatindexLow === 0 ? heatindexLow.toFixed(1) : "";
          stationHistoric.heatindexAvg = heatindexAvg || heatindexAvg === 0 ? heatindexAvg.toFixed(1) : "";
          stationHistoric.pressureMax = pressureMax || pressureMax === 0 ? pressureMax.toFixed(1) : "";
          stationHistoric.pressureMin = pressureMin || pressureMin === 0 ? pressureMin.toFixed(1) : "";
          stationHistoric.precipTotalHistoric = precipTotal || precipTotal === 0 ? precipTotal.toFixed(1) : "";

          station.push(stationHistoric);
        });

        stationsHistoric.push(station);

      } else {
        const stationHistoric: StationProps = {} as StationProps;

        for (let index = 0; index < 7; index++) {
          stationHistoric.humidityHigh = "";
          stationHistoric.humidityLow = "";
          stationHistoric.humidityAvg = "";
          stationHistoric.tempHigh = "";
          stationHistoric.tempLow = "";
          stationHistoric.tempAvg = "";
          stationHistoric.windspeedHigh = "";
          stationHistoric.windspeedLow = "";
          stationHistoric.windspeedAvg = "";
          stationHistoric.windgustHigh = "";
          stationHistoric.windgustLow = "";
          stationHistoric.windgustAvg = "";
          stationHistoric.dewptHigh = "";
          stationHistoric.dewptLow = "";
          stationHistoric.dewptAvg = "";
          stationHistoric.windchillHigh = "";
          stationHistoric.windchillLow = "";
          stationHistoric.windchillAvg = "";
          stationHistoric.heatindexHigh = "";
          stationHistoric.heatindexLow = "";
          stationHistoric.heatindexAvg = "";
          stationHistoric.pressureMax = "";
          stationHistoric.pressureMin = "";
          stationHistoric.precipTotalHistoric = "";

          station.push(stationHistoric);
        }

        stationsHistoric.push(station);
      }
    });
  }

  return { stationsHistoric };
});

