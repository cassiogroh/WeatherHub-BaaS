import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Loader from "react-loader-spinner";

import Header from "../../components/Header";
import ProfileHeader from "../../components/ProfileHeader";
import StationCard, { ViewProps } from "../../components/StationCard";
import ToggleStats from "../../components/ToggleStats";

import { useAuth } from "../../hooks/auth";
import { useToast } from "../../hooks/toast";
import { callableFunction } from "../../services/api";

import { Container, StationsStats } from "./styles";
import { cloudFunctions } from "../../services/cloudFunctions";
import { CurrentConditions, HistoricConditions } from "../../models/station";

const Dashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [ currentConditions, setCurrentConditions ] = useState([] as CurrentConditions[]);
  const [ historicConditions, setHistoricConditions ] = useState([] as HistoricConditions[]);
  const [ triggerAddLoader, setTriggerAddLoader ] = useState(false);
  const [ inputValue, setInputValue ] = useState("");
  const [ isLoading, setIsLoading ] = useState(true);

  // ToggleStats component
  const [toggleInputSlider, setToggleInputSlider] = useState(false);
  const [currentHistoricDay, setCurrentHistoricDay] = useState(0);
  const [minStatus, setMinStatus] = useState(true);
  const [medStatus, setMedStatus] = useState(false);
  const [maxStatus, setMaxStatus] = useState(true);
  const [ propsView, setPropsView ] = useState<ViewProps>({
    temp: true,
    dewpt: false,
    heatIndex: false,
    windChill: false,
    humidity: true,
    precipTotal: true,
    precipRate: false,
    windGust: false,
    windSpeed: false,
    pressure: false,
    elev: false,
  });

  useEffect(() => {
    const loadStationsData = async () => {
      const userId = user.userId;

      if (!userId) return;

      const stationsIds = user.wuStations.map(station => station.id);

      const data = await callableFunction(
        cloudFunctions.getCurrentConditions,
        { userId, stationsIds },
      );

      const currentData = data.currentConditions as CurrentConditions[];

      setCurrentConditions(currentData);
      setIsLoading(false);
    };

    loadStationsData();
  }, [user]);

  const onToggleHistory = useCallback(async () => {
    const historicLength = historicConditions.length;
    const stationsIds = user.wuStations.map(station => station.id);

    setToggleInputSlider(!toggleInputSlider);

    const hasAlreadyFetchedHistoricConditions = historicLength === stationsIds.length;
    if (hasAlreadyFetchedHistoricConditions) return;

    setIsLoading(true);
    const userId = user.userId;

    const data = await callableFunction(
      cloudFunctions.getHistoricalConditions,
      { userId, stationsIds },
    );

    const historicData = data.historicConditions as HistoricConditions[];

    console.log(historicData);

    setHistoricConditions(historicData);
    setIsLoading(false);
  }, [historicConditions, toggleInputSlider, user]);

  const handleInputCheck = useCallback((value: boolean, propName: keyof(typeof propsView)): void => {
    const changedPropsView = { ...propsView };
    changedPropsView[propName] = value;

    setPropsView(changedPropsView);
  }, [propsView]);

  const handleDeleteStation = useCallback(async (stationId: string): Promise<void> => {
    stationId = stationId.toUpperCase();

    if (currentConditions.length === 1) {
      addToast({
        type: "error",
        title: "ID: " + stationId,
        description: "Você não pode remover a sua única estação.",
      });

      return;
    }

    const confirmDelete = window.confirm(`A estação ${stationId} será removida do seu dashboard.`);
    if (!confirmDelete) return;

    setTriggerAddLoader(true);

    try {
      await callableFunction("deleteStation", { stationId, userId: user.userId });

      addToast({
        type: "success",
        title: "ID: " + stationId,
        description: "Estação removida com sucesso",
      });

      setCurrentConditions(state => state.filter(station => station.stationId !== stationId));
    } catch {
      addToast({
        type: "error",
        title: "ID: " + stationId,
        description: "Algo deu errado. Recarrege a página e tente novamente",
      });

      return;
    }

    setTriggerAddLoader(false);
  }, [addToast, currentConditions.length, user]);

  const handleAddStation = useCallback(async (event: FormEvent, stationId: string): Promise<void> => {
    event.preventDefault();

    if (stationId === "") {
      addToast({
        type: "error",
        title: "ID Inválido",
        description: "Preencha o campo corretamente.",
      });

      return;
    }

    const alreadyExists = currentConditions.find(station => station.stationId === stationId);

    if (alreadyExists) {
      addToast({
        type: "info",
        title: "ID: " + stationId,
        description: "Estação já existente no acervo.",
      });

      return;
    }

    interface ResponseProps {
      historicConditions: HistoricConditions[];
      currentConditions: CurrentConditions[];
    }

    try {
      setTriggerAddLoader(true);
      const data: ResponseProps = await callableFunction(cloudFunctions.addNewStation, { stationId, userId: user.userId });
      addToast({
        type: "success",
        title: "ID: " + stationId,
        description: "Estação adicionada com sucesso!",
      });

      setInputValue("");

      setHistoricConditions(oldStations => [...oldStations, data.historicConditions[0]]);
      setCurrentConditions(oldStations => [...oldStations, data.currentConditions[0]]);

    } catch {
      addToast({
        type: "error",
        title: "ID inválido",
        description: "A estação não existe ou está temporariamente offline.",
      });
    }

    setTriggerAddLoader(false);
  }, [currentConditions, addToast, user.userId]);

  const data = useMemo(() => {
    interface dataInfo {
      low: string | number;
      max: string | number;
      prec: string | number;
    }
    const d: dataInfo[] = [] as dataInfo[];

    historicConditions.forEach((stationData) => {
      if (!stationData[currentHistoricDay + 6]) {
        d.push({
          low: "",
          max: "",
          prec: "",
        });
      } else {
        d.push({
          low: String(stationData[currentHistoricDay + 6].tempLow).replace(/\./g, ","),
          max: String(stationData[currentHistoricDay + 6].tempHigh).replace(/\./g, ","),
          prec: Number(stationData[currentHistoricDay + 6].precipTotalHistoric) === 0 ? "" : String(stationData[currentHistoricDay + 6].precipTotalHistoric).replace(/\./g, ","),
        });
      }
    });

    let formattedData = "";

    if (d.length >= 12) formattedData = `${d[0].low};${d[0].max};;${d[0].prec};;;${d[1].low};${d[1].max};;${d[1].prec};;;${d[2].low};${d[2].max};;${d[2].prec};;;${d[3].low};${d[3].max};;${d[3].prec};;;${d[4].low};${d[4].max};;${d[4].prec};;;;;;;;${d[5].low};${d[5].max};;${d[5].prec};;;${d[6].low};${d[6].max};;${d[6].prec};;;${d[7].low};${d[7].max};;${d[7].prec};;;;;;;;${d[8].low};${d[8].max};;${d[8].prec};;;;;${d[9].low};${d[9].max};;${d[9].prec};;;;;${d[10].low};${d[10].max};;${d[10].prec};;;${d[11].low};${d[11].max};;${d[11].prec}`;

    return formattedData;
  }, [historicConditions, currentHistoricDay]);

  const copyData = useCallback(() => {
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = data;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);

    if (currentConditions.length >= 12) {
      addToast({
        type: "success",
        title: "Dados copiados!",
      });
    } else {
      addToast({
        type: "error",
        title: "Erro ao copiar",
        description: "Organize as 12 estações para copiar os dados.",
      });
    }

  }, [currentConditions, data, addToast]);

  return (
    <>
      <Header />
      <ProfileHeader />

      <Container triggerAddLoader={triggerAddLoader}>
        <ToggleStats
          handleInputCheck={handleInputCheck}
          handleAddStation={handleAddStation}
          toggleInputSlider={toggleInputSlider}
          setToggleInputSlider={onToggleHistory}
          minStatus={minStatus}
          setMinStatus={setMinStatus}
          medStatus={medStatus}
          setMedStatus={setMedStatus}
          maxStatus={maxStatus}
          setMaxStatus={setMaxStatus}
          copyData={copyData}
          currentHistoricDay={currentHistoricDay}
          setCurrentHistoricDay={setCurrentHistoricDay}
          inputValue={inputValue}
          setInputValue={setInputValue}
        />

        {isLoading && (
          <div style= {{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 130 }}>
            <p style= {{ marginBottom: 20, fontSize: "2.4rem" }}>Carregando...</p>
            <Loader type='Circles' color='#3b5998' height={100} width={100} />
          </div>
        )}

        {!isLoading && (
          <StationsStats>
            {currentConditions.map((station, index: number) => (
              <StationCard
                key={station.stationId}
                currentData={station}
                historicData={historicConditions[index] || { conditions: [] }}
                propsView={station.status === "online" ? propsView : undefined}
                handleDeleteStation={handleDeleteStation}
                currentOrHistoric={toggleInputSlider}
                minStatus={minStatus}
                medStatus={medStatus}
                maxStatus={maxStatus}
                currentHistoricDay={currentHistoricDay + 6}
              />
            ),
            )}
          </StationsStats>
        )}
      </Container>
      {/* } */}
    </>
  );
};

export default Dashboard;
