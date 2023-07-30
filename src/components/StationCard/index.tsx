import React, { useState, useCallback, useRef } from 'react';

import { FiTrash2, FiEdit, FiFrown, FiEdit3 } from 'react-icons/fi';

import api from '../../services/api';

import { Container, CardStats, CardBottom, RenameField } from './styles';

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

export interface RequestProps {
  currentData: StationCurrentProps;
  historicData: Array<StationHistoricProps>;
  propsView?: ViewProps;
  handleDeleteStation?: any;
  user?: object;
  currentOrHistoric: boolean; // false=current true=historic
  minStatus: boolean;
  medStatus: boolean;
  maxStatus: boolean;
  currentHistoricDay: number;
}

const StationCard: React.FC<RequestProps> = ({
  currentData,
  historicData,
  propsView,
  handleDeleteStation,
  user,
  currentOrHistoric,
  minStatus,
  medStatus,
  maxStatus,
  currentHistoricDay
}: RequestProps ) => {

  const {
    status,
    stationID,
    name,
    url,
    // neighborhood,
    dewpt,
    humidity,
    elev,
    heatIndex,
    precipRate,
    precipTotal,
    pressure,
    temp,
    windChill,
    windGust,
    windSpeed
  } = currentData;

  //@TODO Attribute variables even if there's not historic data
  // if (historicData && historicData[currentHistoricDay]) {
    var {
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
      precipTotalHistoric,
    } = historicData[currentHistoricDay];
  // }

  const [inputFocus, setInputFocus] = useState(false);
  const [renameButtonFocus, setRenameButtonFocus] = useState(false);
  const [deleteButtonFocus, setDeleteButtonFocus] = useState(false);
  const [rename, setRename] = useState(false);
  const [stationName, setStationName] = useState(name);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleRenameStation = useCallback(() => {
    setRename(!rename);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 5)
  }, [rename]);

  const confirmRenameStation = 
  useCallback(async (stationId: string, newName: string | undefined, currentName: string): Promise<void> => {
    if (currentName !== newName && newName !== '') {
      await api.put('/users/stations', {
          stationId,
          newName,
        }
      );
      
      !!newName && setStationName(newName);
    };

    setRename(false);
  }, []);

  const handleFocus = useCallback((focusedVariable: string) => {
    switch (focusedVariable) {
      case 'renameInput':
        return setInputFocus(true);
      case 'renameButton':
        return setRenameButtonFocus(true);
      case 'deleteButton':
        return setDeleteButtonFocus(true);
      default:
        return null;
    };
  }, []);

  const handleBlur = useCallback((focusedVariable: string) => {
    switch (focusedVariable) {
      case 'renameInput': {
        confirmRenameStation(stationID, inputRef.current?.value, stationName);
        return setInputFocus(false);
      }
      case 'renameButton':
        return setRenameButtonFocus(false);
      case 'deleteButton':
        return setDeleteButtonFocus(false);
      default:
        return null;
    }
  }, [confirmRenameStation, stationID, stationName]);

  return (
    <Container>
        <CardStats>
          {rename ?
          <RenameField inputFocus={inputFocus}>
            <input
              ref={inputRef}
              defaultValue={stationName}
              type='text'
              onFocus={() => handleFocus('renameInput')}
              onBlur={() => handleBlur('renameInput')}
            />
            <button
              type='button'
              onClick={() => confirmRenameStation(stationID, inputRef.current?.value, stationName)}
            >
              <FiEdit3 stroke={inputFocus ? '#3FCA87' : '#ddd'} />
            </button>
          </RenameField>
          : <a href={url} target='blank'> { stationName } </a>
          }          
          
          {status === 'online' && !!propsView && currentOrHistoric===false ?
          <>
            { propsView.temp && <p>Temperatura <span>{temp} °C</span></p>}
            { propsView.dewpt && <p>Ponto de orvalho <span>{dewpt} °C</span></p>}
            { propsView.heatIndex && <p>Índice de calor <span>{heatIndex} °C</span></p>}
            { propsView.windChill && <p>Sensação térmica <span>{windChill} °C</span></p>}
            { propsView.humidity && <p>Humidade relativa <span>{humidity} %</span></p>}
            { propsView.precipTotal && <p>Precipitação Total <span>{precipTotal} mm</span></p>}
            { propsView.precipRate && <p>Taxa de precipitação <span>{precipRate} mm/h</span></p>}
            { propsView.windGust && <p>Rajada de vento <span>{windGust} km/h</span></p>}
            { propsView.windSpeed && <p>Velocidade do vento <span>{windSpeed} km/h</span></p>}
            { propsView.pressure && <p>Pressão atmosférica <span>{pressure} hPa</span></p>}
            { propsView.elev && <p>Elevação <span>{elev} m</span></p>}
          </> : (
            status === 'online' && !!propsView && currentOrHistoric ?
            <>
              { propsView.temp && <h4>Temperatura</h4>}
              { propsView.temp && minStatus && <p>Mín <span>{tempLow} °C</span></p>}
              { propsView.temp && medStatus && <p>Méd <span>{tempAvg} °C</span></p>}
              { propsView.temp && maxStatus && <p>Máx <span>{tempHigh} °C</span></p>}

              { propsView.dewpt && <h4>Ponto de orvalho</h4>}
              { propsView.dewpt && minStatus && <p>Mín <span>{dewptLow} °C</span></p>}
              { propsView.dewpt && medStatus && <p>Méd <span>{dewptAvg} °C</span></p>}
              { propsView.dewpt && maxStatus && <p>Máx <span>{dewptHigh} °C</span></p>}

              { propsView.heatIndex && <h4>Índice de calor</h4>}
              { propsView.heatIndex && minStatus && <p>Mín <span>{heatindexLow} °C</span></p>}
              { propsView.heatIndex && medStatus && <p>Méd <span>{heatindexAvg} °C</span></p>}
              { propsView.heatIndex && maxStatus && <p>Máx <span>{heatindexHigh} °C</span></p>}

              { propsView.windChill && <h4>Sensação térmica</h4>}
              { propsView.windChill && minStatus && <p>Mín <span>{windchillLow} °C</span></p>}
              { propsView.windChill && medStatus && <p>Méd <span>{windchillAvg} °C</span></p>}
              { propsView.windChill && maxStatus && <p>Máx <span>{windchillHigh} °C</span></p>}

              { propsView.humidity && <h4>Humidade relativa</h4>}
              { propsView.humidity && minStatus && <p>Mín <span>{humidityLow} %</span></p>}
              { propsView.humidity && medStatus && <p>Méd <span>{humidityAvg} %</span></p>}
              { propsView.humidity && maxStatus && <p>Máx <span>{humidityHigh} %</span></p>}

              { propsView.precipTotal && <h4>Precipitação</h4>}
              { propsView.precipTotal && minStatus && <p>Total <span>{precipTotalHistoric} mm</span></p>}

              { propsView.windGust && <h4>Rajada de vento</h4>}
              { propsView.windGust && minStatus && <p>Mín <span>{windgustLow} km/h</span></p>}
              { propsView.windGust && medStatus && <p>Méd <span>{windgustAvg} km/h</span></p>}
              { propsView.windGust && maxStatus && <p>Máx <span>{windgustHigh} km/h</span></p>}

              { propsView.windSpeed && <h4>Velocidade do vento</h4>}
              { propsView.windSpeed && minStatus && <p>Mín <span>{windspeedLow} km/h</span></p>}
              { propsView.windSpeed && medStatus && <p>Méd <span>{windspeedAvg} km/h</span></p>}
              { propsView.windSpeed && maxStatus && <p>Máx <span>{windspeedHigh} km/h</span></p>}

              { propsView.pressure && <h4>Pressão atmosférica</h4>}
              { propsView.pressure && minStatus && <p>Mín <span>{pressureMin} hPa</span></p>}
              { propsView.pressure && maxStatus && <p>Máx <span>{pressureMax} hPa</span></p>}
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
          <p>ID: {stationID} </p>
          
          {!!user && 
          <div>
            <button
              onClick={handleRenameStation}
              onMouseEnter={() => handleFocus('renameButton')}
              onMouseLeave={() => handleBlur('renameButton')}
              type='button'>
              <FiEdit size={23} stroke={renameButtonFocus ? '#3FCA87' : '#ddd'} />
            </button>
            <button
              onClick={(() => handleDeleteStation(stationID))}
              onMouseEnter={() => handleFocus('deleteButton')}
              onMouseLeave={() => handleBlur('deleteButton')}
              type='button' >
              <FiTrash2 size={23} stroke={deleteButtonFocus ? '#FF9077' : '#ddd'} />
            </button>
          </div>
          }
        </CardBottom>
    </Container>
  )
};

export default StationCard;