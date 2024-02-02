import { subDays } from "date-fns";
import { HistoricApiResponse } from "../../getHistoricConditions";
import { HistoricConditions } from "../../models/station";
import { historyConditionsMock } from "../constans";
import { formatValue } from "./buildCurrentConditions";

interface BuildHistoricConditions {
  historicConditions: HistoricApiResponse;
  lastFetchUnix: number;
  neighborhood?: string;
  softwareType?: string;
  country?: string;
  stationId?: string;
}

export const buildHistoricConditions = ({
  historicConditions,
  lastFetchUnix,
  neighborhood,
  softwareType,
  country,
}: BuildHistoricConditions): HistoricConditions => {
  const observations = historicConditions.summaries;

  // Seven days of observations are expected, but if the station had been
  // offline for more than one day, the API will return less than seven days
  // of observations, so we need to fill the gaps with mock data (null).
  const indexToReplace: number[] = [];

  const now = new Date();
  const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()));

  const sevenDaysAgo = subDays(utcDate, 6);

  const observationDate = new Date(observations[0].obsTimeLocal);
  const observationDay = observationDate.getUTCDate();

  const isObservationsLessThanSeven = observations.length < 7;
  const isObservationsFirstDayNotSevenDaysAgo = observationDay !== sevenDaysAgo.getUTCDate();
  const isObservationsLastDayNotToday = new Date(observations[observations.length - 1].obsTimeLocal).getUTCDate() !== new Date().getUTCDate();

  if (isObservationsLessThanSeven) {
    // Iterate over the observations array, excluding the last element
    for (let i = 0; i < observations.length - 1; i++) {
      // Get the date (day of the month) of the current observation
      const date1 = new Date(observations[i].obsTimeLocal).getUTCDate();
      // Get the date (day of the month) of the next observation
      const date2 = new Date(observations[i + 1].obsTimeLocal).getUTCDate();

      // Check if the gap between the current observation date and the next observation date is more than one day
      const isDateGapMoreThanOneDay = date2 > date1 + 1;

      // If the date gap is more than one day, add the index of the next observation to the indexToReplace array
      if (isDateGapMoreThanOneDay) indexToReplace.push(i+1);
    }
  }

  if (isObservationsFirstDayNotSevenDaysAgo) indexToReplace.push(0);
  if (isObservationsLastDayNotToday) indexToReplace.push(7);

  const isIndexToReplaceNotEmpty = indexToReplace.length > 0;

  if (isIndexToReplaceNotEmpty) {
    indexToReplace.forEach(index => {
      observations.splice(index, 0, historyConditionsMock);
    });
  }

  const station: HistoricConditions = {
    stationId: observations[0].stationID,
    observationTimeUTC: observations[0].obsTimeUtc,
    observationTimeLocal: observations[0].obsTimeLocal,
    geolocation: {
      latitude: observations[0].lat,
      longitude: observations[0].lon,
    },
    lastFetchUnix,
    status: "online",
    country: country || "",
    neighborhood: neighborhood || "",
    softwareType: softwareType || "",
    url: `https://www.wunderground.com/dashboard/pws/${observations[0].stationID}`,
    conditions: [],
  };

  // Populate the station with the last seven days of observations
  observations.forEach((historicData) => {
    const { metric } = historicData;

    station.conditions.push({
      tempHigh: formatValue(metric.tempHigh),
      tempLow: formatValue(metric.tempLow),
      tempAvg: formatValue(metric.tempAvg),
      windspeedHigh: formatValue(metric.windspeedHigh),
      windspeedLow: formatValue(metric.windspeedLow),
      windspeedAvg: formatValue(metric.windspeedAvg),
      windgustHigh: formatValue(metric.windgustHigh),
      windgustLow: formatValue(metric.windgustLow),
      windgustAvg: formatValue(metric.windgustAvg),
      dewptHigh: formatValue(metric.dewptHigh),
      dewptLow: formatValue(metric.dewptLow),
      dewptAvg: formatValue(metric.dewptAvg),
      windchillHigh: formatValue(metric.windchillHigh),
      windchillLow: formatValue(metric.windchillLow),
      windchillAvg: formatValue(metric.windchillAvg),
      heatindexHigh: formatValue(metric.heatindexHigh),
      heatindexLow: formatValue(metric.heatindexLow),
      heatindexAvg: formatValue(metric.heatindexAvg),
      pressureMax: formatValue(metric.pressureMax),
      pressureMin: formatValue(metric.pressureMin),
      precipTotal: formatValue(metric.precipTotal),
      precipRate: formatValue(metric.precipRate),
      pressureTrend: formatValue(metric.pressureTrend),
      humidityLow: formatValue(historicData.humidityLow),
      humidityAvg: formatValue(historicData.humidityAvg),
      humidityHigh: formatValue(historicData.humidityHigh),
      uvHigh: formatValue(historicData.uvHigh),
      winddirAvg: formatValue(historicData.winddirAvg),
      solarRadiationHigh: formatValue(historicData.solarRadiationHigh),
    });
  });

  return station;
};
