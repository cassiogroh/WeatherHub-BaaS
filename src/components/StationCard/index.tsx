import { useState, useCallback, useRef } from "react";
import { FiTrash2, FiEdit, FiFrown, FiEdit3 } from "react-icons/fi";

import { callableFunction } from "../../services/api";
import { useAuth } from "../../hooks/auth";

import { Container, CardStats, CardBottom, RenameField, LastUpdateHour, RankBadge } from "./styles";
import { CurrentConditions, HistoricConditions, HistoricConditionsData } from "../../models/station";
import { cloudFunctions } from "../../services/cloudFunctions";
import { formatDate } from "../../utils/formatDate";

export interface ViewProps {
  temp: boolean,
  dewpt: boolean,
  heatIndex: boolean,
  windChill: boolean,
  humidity: boolean,
  precipTotal: boolean,
  precipRate: boolean,
  windGust: boolean,
  windSpeed: boolean,
  pressure: boolean,
  elev: boolean,
}

export interface RequestProps {
  currentData: CurrentConditions;
  historicData: HistoricConditions;
  propsView?: ViewProps;
  handleDeleteStation?: any;
  currentOrHistoric: boolean; // false=current true=historic
  minStatus: boolean;
  medStatus: boolean;
  maxStatus: boolean;
  currentHistoricDay: number;
  rank?: number; // position when the dashboard is sorted by a metric
  highlightedMetric?: string; // condition key the dashboard is sorted by
}

const StationCard = ({
  currentData,
  historicData,
  propsView,
  handleDeleteStation,
  currentOrHistoric,
  minStatus,
  medStatus,
  maxStatus,
  currentHistoricDay,
  rank,
  highlightedMetric,
}: RequestProps ) => {
  const { user } = useAuth();

  const highlight = (metric: string) => (metric === highlightedMetric ? "highlighted" : undefined);

  const {
    status,
    stationId,
    url,
    neighborhood,
    observationTimeUTC,
  } = currentData;

  const {
    dewPoint,
    humidity,
    elevation,
    heatIndex,
    precipRate,
    precipTotal,
    pressure,
    temperature,
    windChill,
    windGust,
    windSpeed,
  } = currentData.conditions;

  const hasHistoricData = historicData && historicData.conditions[currentHistoricDay];
  if (!hasHistoricData) historicData.conditions[currentHistoricDay] = {} as HistoricConditionsData;

  const {
    lastFetchUnix: historicLastFetchUnix,
  } = historicData;

  const {
    humidityHigh,
    humidityLow,
    humidityAvg,
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
    precipTotal: precipTotalHistoric,
  } = historicData.conditions[currentHistoricDay];

  const [inputFocus, setInputFocus] = useState(false);
  const [renameButtonFocus, setRenameButtonFocus] = useState(false);
  const [deleteButtonFocus, setDeleteButtonFocus] = useState(false);
  const [rename, setRename] = useState(false);
  const [stationName, setStationName] = useState(() => {
    const userStations = user.wuStations;

    const currentStation = userStations.find(station => station.id === stationId);

    return currentStation?.name || neighborhood;
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const handleRenameStation = useCallback(() => {
    setRename(!rename);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 5);
  }, [rename]);

  const confirmRenameStation =
  useCallback(async (stationId: string, newName: string | undefined, currentName: string): Promise<void> => {
    if (currentName !== newName && newName !== "") {
      await callableFunction(cloudFunctions.renameStation, { stationId, newName, userId: user.userId });

      !!newName && setStationName(newName);
    }

    setRename(false);
  }, [user.userId]);

  const handleFocus = useCallback((focusedVariable: string) => {
    switch (focusedVariable) {
    case "renameInput":
      return setInputFocus(true);
    case "renameButton":
      return setRenameButtonFocus(true);
    case "deleteButton":
      return setDeleteButtonFocus(true);
    default:
      return null;
    }
  }, []);

  const handleBlur = useCallback((focusedVariable: string) => {
    switch (focusedVariable) {
    case "renameInput": {
      confirmRenameStation(stationId, inputRef.current?.value, stationName);
      return setInputFocus(false);
    }
    case "renameButton":
      return setRenameButtonFocus(false);
    case "deleteButton":
      return setDeleteButtonFocus(false);
    default:
      return null;
    }
  }, [confirmRenameStation, stationId, stationName]);

  return (
    <Container>
      {!!rank && <RankBadge title={`${rank}º lugar`}>{rank}º</RankBadge>}

      <CardStats>
        {rename ?
          <RenameField inputFocus={inputFocus}>
            <input
              ref={inputRef}
              defaultValue={stationName}
              type='text'
              onFocus={() => handleFocus("renameInput")}
              onBlur={() => handleBlur("renameInput")}
            />
            <button
              type='button'
              onClick={() => confirmRenameStation(stationId, inputRef.current?.value, stationName)}
            >
              <FiEdit3 stroke={inputFocus ? "var(--button-color)" : "var(--text-color)"} />
            </button>
          </RenameField>
          : <a title="Abrir estação em nova aba" href={url} target='_blank' rel='noopener noreferrer'>{stationName}</a>
        }

        {status === "online" && !!propsView && currentOrHistoric===false ?
          <>
            { propsView.temp && <p className={highlight("temperature")}>Temperatura <span>{temperature} °C</span></p>}
            { propsView.dewpt && <p className={highlight("dewPoint")}>Ponto de orvalho <span>{dewPoint} °C</span></p>}
            { propsView.heatIndex && <p className={highlight("heatIndex")}>Índice de calor <span>{heatIndex} °C</span></p>}
            { propsView.windChill && <p className={highlight("windChill")}>Sensação térmica <span>{windChill} °C</span></p>}
            { propsView.humidity && <p className={highlight("humidity")}>Humidade relativa <span>{humidity} %</span></p>}
            { propsView.precipTotal && <p className={highlight("precipTotal")}>Precipitação Total <span>{precipTotal} mm</span></p>}
            { propsView.precipRate && <p className={highlight("precipRate")}>Taxa de precipitação <span>{precipRate} mm/h</span></p>}
            { propsView.windGust && <p className={highlight("windGust")}>Rajada de vento <span>{windGust} km/h</span></p>}
            { propsView.windSpeed && <p className={highlight("windSpeed")}>Velocidade do vento <span>{windSpeed} km/h</span></p>}
            { propsView.pressure && <p className={highlight("pressure")}>Pressão atmosférica <span>{pressure} hPa</span></p>}
            { propsView.elev && <p className={highlight("elevation")}>Elevação <span>{elevation} m</span></p>}
          </> : (
            status === "online" && !!propsView && currentOrHistoric ?
              <>
                { propsView.temp && <h4>Temperatura</h4>}
                { propsView.temp && minStatus && <p className={highlight("tempLow")}>Mín <span>{tempLow} °C</span></p>}
                { propsView.temp && medStatus && <p className={highlight("tempAvg")}>Méd <span>{tempAvg} °C</span></p>}
                { propsView.temp && maxStatus && <p className={highlight("tempHigh")}>Máx <span>{tempHigh} °C</span></p>}

                { propsView.dewpt && <h4>Ponto de orvalho</h4>}
                { propsView.dewpt && minStatus && <p className={highlight("dewptLow")}>Mín <span>{dewptLow} °C</span></p>}
                { propsView.dewpt && medStatus && <p className={highlight("dewptAvg")}>Méd <span>{dewptAvg} °C</span></p>}
                { propsView.dewpt && maxStatus && <p className={highlight("dewptHigh")}>Máx <span>{dewptHigh} °C</span></p>}

                { propsView.heatIndex && <h4>Índice de calor</h4>}
                { propsView.heatIndex && minStatus && <p className={highlight("heatindexLow")}>Mín <span>{heatindexLow} °C</span></p>}
                { propsView.heatIndex && medStatus && <p className={highlight("heatindexAvg")}>Méd <span>{heatindexAvg} °C</span></p>}
                { propsView.heatIndex && maxStatus && <p className={highlight("heatindexHigh")}>Máx <span>{heatindexHigh} °C</span></p>}

                { propsView.windChill && <h4>Sensação térmica</h4>}
                { propsView.windChill && minStatus && <p className={highlight("windchillLow")}>Mín <span>{windchillLow} °C</span></p>}
                { propsView.windChill && medStatus && <p className={highlight("windchillAvg")}>Méd <span>{windchillAvg} °C</span></p>}
                { propsView.windChill && maxStatus && <p className={highlight("windchillHigh")}>Máx <span>{windchillHigh} °C</span></p>}

                { propsView.humidity && <h4>Humidade relativa</h4>}
                { propsView.humidity && minStatus && <p className={highlight("humidityLow")}>Mín <span>{humidityLow} %</span></p>}
                { propsView.humidity && medStatus && <p className={highlight("humidityAvg")}>Méd <span>{humidityAvg} %</span></p>}
                { propsView.humidity && maxStatus && <p className={highlight("humidityHigh")}>Máx <span>{humidityHigh} %</span></p>}

                { propsView.precipTotal && <h4>Precipitação</h4>}
                { propsView.precipTotal && minStatus && <p className={highlight("precipTotal")}>Total <span>{precipTotalHistoric} mm</span></p>}

                { propsView.windGust && <h4>Rajada de vento</h4>}
                { propsView.windGust && minStatus && <p className={highlight("windgustLow")}>Mín <span>{windgustLow} km/h</span></p>}
                { propsView.windGust && medStatus && <p className={highlight("windgustAvg")}>Méd <span>{windgustAvg} km/h</span></p>}
                { propsView.windGust && maxStatus && <p className={highlight("windgustHigh")}>Máx <span>{windgustHigh} km/h</span></p>}

                { propsView.windSpeed && <h4>Velocidade do vento</h4>}
                { propsView.windSpeed && minStatus && <p className={highlight("windspeedLow")}>Mín <span>{windspeedLow} km/h</span></p>}
                { propsView.windSpeed && medStatus && <p className={highlight("windspeedAvg")}>Méd <span>{windspeedAvg} km/h</span></p>}
                { propsView.windSpeed && maxStatus && <p className={highlight("windspeedHigh")}>Máx <span>{windspeedHigh} km/h</span></p>}

                { propsView.pressure && <h4>Pressão atmosférica</h4>}
                { propsView.pressure && minStatus && <p className={highlight("pressureMin")}>Mín <span>{pressureMin} hPa</span></p>}
                { propsView.pressure && maxStatus && <p className={highlight("pressureMax")}>Máx <span>{pressureMax} hPa</span></p>}
              </>
              :
              <div>
                <p>Estação offline</p>
                <FiFrown size={50} />
              </div>
          )
        }
      </CardStats>

      <CardBottom>
        <p>{stationId}</p>

        <LastUpdateHour>
          {formatDate({
            date: currentOrHistoric ? historicLastFetchUnix : observationTimeUTC,
            formatQuery: "HH':'mm' h'",
          })}
        </LastUpdateHour>

        {!!user &&
          <div>
            <button
              onClick={handleRenameStation}
              onMouseEnter={() => handleFocus("renameButton")}
              onMouseLeave={() => handleBlur("renameButton")}
              type='button'>
              <FiEdit title="Renomear estação" size={23} stroke={renameButtonFocus ? "#3FCA87" : "var(--text-color)"} />
            </button>
            <button
              onClick={(() => handleDeleteStation(stationId))}
              onMouseEnter={() => handleFocus("deleteButton")}
              onMouseLeave={() => handleBlur("deleteButton")}
              type='button' >
              <FiTrash2 title="Remover estação" size={23} stroke={deleteButtonFocus ? "#FF9077" : "var(--text-color)"} />
            </button>
          </div>
        }
      </CardBottom>
    </Container>
  );
};

export default StationCard;
