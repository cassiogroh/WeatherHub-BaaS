import { FormEvent, useCallback, useMemo, useRef } from "react";
import { FiArrowLeftCircle, FiArrowRightCircle, FiPlus } from "react-icons/fi";
import { format, isAfter, getDate, getMonth, getYear } from "date-fns";
import { ptBR } from "date-fns/locale";

import InputOption from "./InputOption";
import { useToast } from "../../hooks/toast";

import {
  Container,
  Options,
  OptionsHeader,
  HistoricOptions,
  ExclusiveButton,
  StationControls,
  AddStationForm,
  ReorderSwitch,
} from "./styles";
import { useAuth } from "../../hooks/auth";
import { ViewProps } from "../StationCard";

interface ToggleStatsProps {
  handleInputCheck(value: boolean | undefined, name: string): void;
  propsView: ViewProps;
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
  isReordering?: boolean;
  setIsReordering?(toggle: boolean): void;
  sortControl?: React.ReactNode;
}

const ToggleStats = ({
  handleInputCheck,
  propsView,
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
  isReordering = false,
  setIsReordering,
  sortControl,
}: ToggleStatsProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { addToast } = useToast();

  const currentHistoricDayView = useMemo(() => {
    const now = Date.now();
    const date = format(
      new Date(getYear(now), getMonth(now), getDate(now) + currentHistoricDay),
      "dd'/'MMM'",
      { locale: ptBR },
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
        type: "info",
        title: "Aguarde",
        description: "Dados históricos estão disponíveis apenas após 00:15 h",
      });
    }

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
              isQuarterAfterMidnight() && setToggleInputSlider(!toggleInputSlider);
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
            <FiArrowLeftCircle
              style={{ visibility: currentHistoricDay -1 >= -6 ? "visible" : "hidden" }}
              title='Dia anterior'
              size={20}
              color={"#FFF"}
              onClick={() => changeDay(-1)}
            />
            <p>{currentHistoricDayView}</p>
            <FiArrowRightCircle
              style={{ visibility: currentHistoricDay + 1 <= 0 ? "visible" : "hidden" }}
              title='Próximo dia'
              size={20}
              color={"#FFF"}
              onClick={() => changeDay(1)}
            />
          </div>
        </HistoricOptions>

        <InputOption name='Temperatura' propName={"temp"} handleInputCheck={handleInputCheck} checked={propsView.temp} />
        <InputOption name='Ponto de orvalho' propName={"dewpt"} handleInputCheck={handleInputCheck} checked={propsView.dewpt} />
        <InputOption name='Índice de calor' propName={"heatIndex"} handleInputCheck={handleInputCheck} checked={propsView.heatIndex} />
        <InputOption name='Sensação térmica' propName={"windChill"} handleInputCheck={handleInputCheck} checked={propsView.windChill} />
        <InputOption name='Humidade relativa' propName={"humidity"} handleInputCheck={handleInputCheck} checked={propsView.humidity} />
        <InputOption name='Precipitação total' propName={"precipTotal"} handleInputCheck={handleInputCheck} checked={propsView.precipTotal} />
        <InputOption name='Taxa de precipitação' propName={"precipRate"} handleInputCheck={handleInputCheck} checked={propsView.precipRate} disabled={toggleInputSlider} />
        <InputOption name='Rajada de vento' propName={"windGust"} handleInputCheck={handleInputCheck} checked={propsView.windGust} />
        <InputOption name='Velocidade do vento' propName={"windSpeed"} handleInputCheck={handleInputCheck} checked={propsView.windSpeed} />
        <InputOption name='Pressão atmosférica' propName={"pressure"} handleInputCheck={handleInputCheck} checked={propsView.pressure} />
        <InputOption name='Elevação' propName={"elev"} handleInputCheck={handleInputCheck} checked={propsView.elev} disabled={toggleInputSlider} />
        {
          (user.email === "cirogroh@yahoo.com.br" || user.email === "cassiogroh@gmail.com") && toggleInputSlider &&
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
        <StationControls>
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
              title="Adicionar estação"
            >
              <FiPlus size={20} color='var(--primary-color)' strokeWidth={5} />
            </button>
          </AddStationForm>

          {setIsReordering && (
            <ReorderSwitch title='Arraste as estações para mudar a ordem'>
              <input
                type='checkbox'
                checked={isReordering}
                onChange={event => setIsReordering(event.target.checked)}
              />
              <span />
              <p>Reordenar</p>
            </ReorderSwitch>
          )}

          {sortControl}
        </StationControls>
      }
    </Container>
  );
};

export default ToggleStats;
