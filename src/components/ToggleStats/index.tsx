import React, { FormEvent, useCallback, useMemo, useRef } from 'react';
import { FiArrowLeftCircle, FiArrowRightCircle, FiPlus } from 'react-icons/fi';
import { format, isAfter, getDate, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import InputOption from './InputOption';
import { useToast } from '../../hooks/toast';

import { Container, Options, OptionsHeader, HistoricOptions, ExclusiveButton, AddStationForm } from './styles';
import { useAuth } from '../../hooks/auth';

interface Request {
  handleInputCheck(value: boolean | undefined, name: string): void;
  handleAddStation?(event: FormEvent, inputValue: string): void;
  toggleInputSlider: boolean;
  setToggleInputSlider(toggle: boolean): void;
  minStatus: boolean;
  setMinStatus(toggle: boolean): void;
  medStatus: boolean;
  setMedStatus(toggle: boolean): void;
  maxStatus: boolean;
  setMaxStatus(toggle: boolean): void;
  copyData(): void;
  currentHistoricDay: number;
  setCurrentHistoricDay: React.Dispatch<React.SetStateAction<number>>;
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
}

const ToggleStats: React.FC<Request> = ({
  handleInputCheck,
  handleAddStation,
  toggleInputSlider,
  setToggleInputSlider,
  minStatus,
  setMinStatus,
  medStatus,
  setMedStatus,
  maxStatus,
  setMaxStatus,
  copyData,
  currentHistoricDay,
  setCurrentHistoricDay,
  inputValue,
  setInputValue,
}: Request) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { addToast } = useToast();

  const formattedDate = useMemo(() => {
    const date = format(
      Date.now(),
      `dd'/'MMM'/'yyyy 'às' HH':'mm 'h'`,
      { locale: ptBR }
    );

    return date;
  }, []);

  const currentHistoricDayView = useMemo(() => {
    const now = Date.now();
    const date = format(
      new Date(getYear(now), getMonth(now), getDate(now) + currentHistoricDay),
      `dd'/'MMM'`,
      { locale: ptBR }
    );

    return date;
  }, [currentHistoricDay]);

  const changeDay = useCallback((change: number) => {
    if (currentHistoricDay + change <= 0 && currentHistoricDay + change >= -6) {
      setCurrentHistoricDay(oldState => oldState + change);
    }
  }, [currentHistoricDay, setCurrentHistoricDay]);

  const isQuarterAfterMidnight = useCallback(() => {
    const now = Date.now();
    const quarterAfterMidnight = new Date(getYear(now), getMonth(now), getDate(now), 0, 15, 0);

    const permitedTime = isAfter(now, quarterAfterMidnight);

    if (!permitedTime) {
      addToast({
        type: 'info',
        title: 'Aguarde',
        description: 'Dados históricos estão disponíveis apenas após 00:15 h'
      })
    };

    return permitedTime;
  }, [addToast]);

  return (
    <Container>
      <Options>
        <p>Opções de visualização</p>

        <OptionsHeader>
          <p>Atual</p>
          <div>
            <input title='Trocar modo de visualização' onChange={console.log} type="checkbox" checked={toggleInputSlider} />
            <span title='Trocar modo de visualização' onClick={() => {
              // Allow toggle only after 00:15h
              isQuarterAfterMidnight() && setToggleInputSlider(!toggleInputSlider)
            }}>
            </span>
          </div>
          <p>Histórico</p>
        </OptionsHeader>

        <HistoricOptions toggleInputSlider={toggleInputSlider} minStatus={minStatus} medStatus={medStatus} maxStatus={maxStatus}>
          <div>
            <p title='Mínimas' onClick={() => setMinStatus(!minStatus)}>Mín</p>
            <p title='Médias' onClick={() => setMedStatus(!medStatus)}>Méd</p>
            <p title='Máximas' onClick={() => setMaxStatus(!maxStatus)}>Máx</p>
          </div>

          <div>
            <FiArrowLeftCircle title='Dia anterior' size={20} color='#FFF' onClick={() => changeDay(-1)} />
            <p>{currentHistoricDayView}</p>
            <FiArrowRightCircle title='Próximo dia'  size={20} color='#FFF' onClick={() => changeDay(1)} />
          </div>
        </HistoricOptions>
      
        <InputOption name='Temperatura' propName={'temp'} handleInputCheck={handleInputCheck} checked />
        <InputOption name='Ponto de orvalho' propName={'dewpt'} handleInputCheck={handleInputCheck} />
        <InputOption name='Índice de calor' propName={'heatIndex'} handleInputCheck={handleInputCheck} />
        <InputOption name='Sensação térmica' propName={'windChill'} handleInputCheck={handleInputCheck} />
        <InputOption name='Humidade relativa' propName={'humidity'} handleInputCheck={handleInputCheck} checked />
        <InputOption name='Precipitação total' propName={'precipTotal'} handleInputCheck={handleInputCheck} checked />
        <InputOption name='Taxa de precipitação' propName={'precipRate'} handleInputCheck={handleInputCheck} disabled={toggleInputSlider} />
        <InputOption name='Rajada de vento' propName={'windGust'} handleInputCheck={handleInputCheck} />
        <InputOption name='Velocidade do vento' propName={'windSpeed'} handleInputCheck={handleInputCheck} />
        <InputOption name='Pressão atmosférica' propName={'pressure'} handleInputCheck={handleInputCheck} />
        <InputOption name='Elevação' propName={'elev'} handleInputCheck={handleInputCheck} disabled={toggleInputSlider} />
        {
          (user.email === 'cirogroh@yahoo.com.br' || user.email === 'cassiogroh@gmail.com') &&
          <ExclusiveButton
            onClick={copyData}
            type='button'
          >
            Copiar dados
          </ExclusiveButton>
        }
        <span></span>
      </Options>

      {
        handleAddStation &&
        <AddStationForm onSubmit={event => handleAddStation(event, inputValue)}>
          <input
            type="text"
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value.toUpperCase())}
            placeholder='Digite um ID'
          />

          <button
            type='submit'
          >
            <FiPlus size={20} color='#3b5998' strokeWidth={5} />
          </button>
        </AddStationForm>
      }

      <p>Sincronizado em {formattedDate}</p>
    </Container>
  )
}

export default ToggleStats;