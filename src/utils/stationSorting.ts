import { ViewProps } from "../components/StationCard";
import { CurrentConditions, HistoricConditions, HistoricConditionsData } from "../models/station";

export type SortDirection = "desc" | "asc";

export interface SortOption {
  key: string;
  label: string;
}

export interface SortOptionGroup {
  label?: string; // rendered as <optgroup> when set
  options: SortOption[];
}

type CurrentKey = keyof CurrentConditions["conditions"];
type HistoricKey = keyof HistoricConditionsData;
type HistoricStat = "min" | "med" | "max";

// Same metrics, labels and order as the station cards
const currentMetrics: { key: CurrentKey; label: string; view: keyof ViewProps }[] = [
  { key: "temperature", label: "Temperatura", view: "temp" },
  { key: "dewPoint", label: "Ponto de orvalho", view: "dewpt" },
  { key: "heatIndex", label: "Índice de calor", view: "heatIndex" },
  { key: "windChill", label: "Sensação térmica", view: "windChill" },
  { key: "humidity", label: "Humidade relativa", view: "humidity" },
  { key: "precipTotal", label: "Precipitação total", view: "precipTotal" },
  { key: "precipRate", label: "Taxa de precipitação", view: "precipRate" },
  { key: "windGust", label: "Rajada de vento", view: "windGust" },
  { key: "windSpeed", label: "Velocidade do vento", view: "windSpeed" },
  { key: "pressure", label: "Pressão atmosférica", view: "pressure" },
  { key: "elevation", label: "Elevação", view: "elev" },
];

// Daily summaries shown in the historic cards. Precipitation only has a total (shown with "Mín" on)
// and pressure has no average, matching what StationCard renders.
const historicMetrics: { label: string; view: keyof ViewProps; stats: Partial<Record<HistoricStat, { key: HistoricKey; label: string }>> }[] = [
  { label: "Temperatura", view: "temp", stats: { max: { key: "tempHigh", label: "Máx" }, med: { key: "tempAvg", label: "Méd" }, min: { key: "tempLow", label: "Mín" } } },
  { label: "Ponto de orvalho", view: "dewpt", stats: { max: { key: "dewptHigh", label: "Máx" }, med: { key: "dewptAvg", label: "Méd" }, min: { key: "dewptLow", label: "Mín" } } },
  { label: "Índice de calor", view: "heatIndex", stats: { max: { key: "heatindexHigh", label: "Máx" }, med: { key: "heatindexAvg", label: "Méd" }, min: { key: "heatindexLow", label: "Mín" } } },
  { label: "Sensação térmica", view: "windChill", stats: { max: { key: "windchillHigh", label: "Máx" }, med: { key: "windchillAvg", label: "Méd" }, min: { key: "windchillLow", label: "Mín" } } },
  { label: "Humidade relativa", view: "humidity", stats: { max: { key: "humidityHigh", label: "Máx" }, med: { key: "humidityAvg", label: "Méd" }, min: { key: "humidityLow", label: "Mín" } } },
  { label: "Precipitação", view: "precipTotal", stats: { min: { key: "precipTotal", label: "Total" } } },
  { label: "Rajada de vento", view: "windGust", stats: { max: { key: "windgustHigh", label: "Máx" }, med: { key: "windgustAvg", label: "Méd" }, min: { key: "windgustLow", label: "Mín" } } },
  { label: "Velocidade do vento", view: "windSpeed", stats: { max: { key: "windspeedHigh", label: "Máx" }, med: { key: "windspeedAvg", label: "Méd" }, min: { key: "windspeedLow", label: "Mín" } } },
  { label: "Pressão atmosférica", view: "pressure", stats: { max: { key: "pressureMax", label: "Máx" }, min: { key: "pressureMin", label: "Mín" } } },
];

// A metric the stations can be ranked by, and what must be visible on the cards to show it
interface RankingMetric extends SortOption {
  view: keyof ViewProps;
  stat?: HistoricStat;
}

const historicStatsOrder: HistoricStat[] = ["max", "med", "min"];

const getRankingMetrics = (historic: boolean): RankingMetric[] => {
  if (!historic) return currentMetrics;

  return historicMetrics.flatMap(metric => historicStatsOrder
    .filter(stat => metric.stats[stat])
    .map(stat => {
      const { key, label } = metric.stats[stat] as { key: HistoricKey; label: string };
      return { key, label: `${metric.label} · ${label}`, view: metric.view, stat };
    }),
  );
};

interface VisibilityProps {
  historic: boolean;
  propsView: ViewProps;
  minStatus: boolean;
  medStatus: boolean;
  maxStatus: boolean;
}

const isMetricVisible = (metric: RankingMetric, { propsView, minStatus, medStatus, maxStatus }: VisibilityProps) => {
  const visibleStats: Record<HistoricStat, boolean> = { min: minStatus, med: medStatus, max: maxStatus };

  return propsView[metric.view] && (!metric.stat || visibleStats[metric.stat]);
};

export const findRankingMetric = (historic: boolean, key: string) => {
  return getRankingMetrics(historic).find(metric => metric.key === key);
};

export const isRankingMetricVisible = (key: string, visibility: VisibilityProps) => {
  const metric = findRankingMetric(visibility.historic, key);

  return !!metric && isMetricVisible(metric, visibility);
};

// Every metric can be ranked by. The ones already visible on the cards come first.
export function getSortGroups(visibility: VisibilityProps): SortOptionGroup[] {
  const metrics = getRankingMetrics(visibility.historic);
  const toOption = ({ key, label }: RankingMetric) => ({ key, label });

  const visible = metrics.filter(metric => isMetricVisible(metric, visibility)).map(toOption);
  const others = metrics.filter(metric => !isMetricVisible(metric, visibility)).map(toOption);

  return [
    { label: "Visíveis nos cards", options: visible },
    { label: "Outros dados", options: others },
  ].filter(group => group.options.length);
}

interface RankStationsProps<T> {
  stations: T[]; // in dashboard order, used to break ties
  sortKey: string;
  direction: SortDirection;
  historicDayIndex: number;
}

const getValue = (station: CurrentConditions | HistoricConditions, sortKey: string, historicDayIndex: number) => {
  if (station.status !== "online") return NaN;

  const raw = Array.isArray(station.conditions)
    ? station.conditions[historicDayIndex]?.[sortKey as HistoricKey]
    : station.conditions[sortKey as CurrentKey];

  return parseFloat(raw ?? ""); // "--" (no data) becomes NaN
};

// Stations without a value (offline or "--") always go last
export function rankStations<T extends CurrentConditions | HistoricConditions>({
  stations,
  sortKey,
  direction,
  historicDayIndex,
}: RankStationsProps<T>): T[] {
  const withValues = stations.map(station => ({ station, value: getValue(station, sortKey, historicDayIndex) }));

  return withValues
    .sort((a, b) => {
      const aMissing = Number.isNaN(a.value);
      const bMissing = Number.isNaN(b.value);

      if (aMissing || bMissing) return Number(aMissing) - Number(bMissing);

      return direction === "desc" ? b.value - a.value : a.value - b.value;
    })
    .map(({ station }) => station);
}
