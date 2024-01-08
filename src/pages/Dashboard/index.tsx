import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Loader from "react-loader-spinner";

import Header from "../../components/Header";
import ProfileHeader from "../../components/ProfileHeader";
import StationCard, { ViewProps } from "../../components/StationCard";
import ToggleStats from "../../components/ToggleStats";

import { useAuth } from "../../hooks/auth";
import { useToast } from "../../hooks/toast";
import { callableFunction } from "../../services/api";

import { Container, LoaderContainer, StationsStats } from "./styles";
import { cloudFunctions } from "../../services/cloudFunctions";
import { CurrentConditions, HistoricConditions, HistoricConditionsData } from "../../models/station";

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [ currentConditions, setCurrentConditions ] = useState([] as CurrentConditions[]);
  const [ historicConditions, setHistoricConditions ] = useState([] as HistoricConditions[]);
  const [ inputValue, setInputValue ] = useState("");
  const [ isLoading, setIsLoading ] = useState(true);

  // ToggleStats component
  const [ toggleInputSlider, setToggleInputSlider ] = useState(false);
  const [ currentHistoricDay, setCurrentHistoricDay ] = useState(0);
  const [ minStatus, setMinStatus ] = useState(true);
  const [ medStatus, setMedStatus ] = useState(false);
  const [ maxStatus, setMaxStatus ] = useState(true);
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

      if (!stationsIds.length) {
        setIsLoading(false);
        return;
      }

      const data = await callableFunction(
        cloudFunctions.getCurrentConditions,
        { userId, stationsIds },
      );

      const currentData = data.currentConditions as CurrentConditions[];

      currentData.sort((a, b) => {
        // Find the corresponding user station for each data item
        const userStationA = user.wuStations.find(station => station.id === a.stationId);
        const userStationB = user.wuStations.find(station => station.id === b.stationId);

        // If we couldn't find a user station, sort the item to the end
        if (!userStationA) return 1;
        if (!userStationB) return -1;

        // Sort by the order property
        return userStationA.order - userStationB.order;
      });

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

    historicData.sort((a, b) => {
      // Find the corresponding user station for each data item
      const userStationA = user.wuStations.find(station => station.id === a.stationId);
      const userStationB = user.wuStations.find(station => station.id === b.stationId);

      // If we couldn't find a user station, sort the item to the end
      if (!userStationA) return 1;
      if (!userStationB) return -1;

      // Sort by the order property
      return userStationA.order - userStationB.order;
    });

    setHistoricConditions(historicData);
    setIsLoading(false);
  }, [historicConditions, toggleInputSlider, user]);

  const handleInputCheck = useCallback((value: boolean, propName: keyof(typeof propsView)) => {
    const changedPropsView = { ...propsView };
    changedPropsView[propName] = value;

    setPropsView(changedPropsView);
  }, [propsView]);

  const handleDeleteStation = useCallback(async (stationId: string) => {
    stationId = stationId.toUpperCase();

    const confirmDelete = window.confirm(`A estação ${stationId} será removida do seu dashboard.`);
    if (!confirmDelete) return;

    try {
      setIsLoading(true);
      await callableFunction(cloudFunctions.deleteStation, { stationId, userId: user.userId });

      setCurrentConditions(state => state.filter(station => station.stationId !== stationId));

      const stationIndex = user.wuStations.findIndex(({ id }) => id === stationId);
      user.wuStations.splice(stationIndex, 1);
      updateUser(user);

      addToast({
        type: "success",
        title: "ID: " + stationId,
        description: "Estação removida com sucesso",
      });

      setIsLoading(false);
    } catch {
      addToast({
        type: "error",
        title: "ID: " + stationId,
        description: "Algo deu errado. Recarrege a página e tente novamente",
      });

      setIsLoading(false);
      return;
    }
  }, [addToast, user, updateUser]);

  const handleAddStation = useCallback(async (event: FormEvent, stationId: string) => {
    event.preventDefault();

    if (stationId === "") {
      addToast({
        type: "error",
        title: "ID Inválido",
        description: "Preencha o campo corretamente.",
      });

      return;
    }

    const alreadyExists = user.wuStations.find(station => station.id === stationId);

    if (alreadyExists) {
      addToast({
        type: "info",
        title: "ID: " + stationId,
        description: "Estação já existente no seu acervo.",
      });

      return;
    }

    interface ResponseProps {
      historicConditions: HistoricConditions;
      currentConditions: CurrentConditions;
      success: boolean;
    }

    try {
      setIsLoading(true);
      const data: ResponseProps = await callableFunction(cloudFunctions.addNewStation, { stationId, userId: user.userId });
      addToast({
        type: "success",
        title: "ID: " + stationId,
        description: "Estação adicionada com sucesso!",
      });

      setInputValue("");

      user.wuStations.push({
        id: stationId,
        order: user.wuStations.length,
        createdAt: Date.now(),
        name: data.currentConditions.neighborhood,
      });
      updateUser(user);

      setCurrentConditions(oldStations => [...oldStations, data.currentConditions]);
      setHistoricConditions(oldStations => {
        if (!oldStations.length) return oldStations;
        return [...oldStations, data.historicConditions];
      });
      setIsLoading(false);
    } catch {
      addToast({
        type: "error",
        title: "ID inválido",
        description: "A estação não existe ou está temporariamente offline.",
      });
    }

    setIsLoading(false);
  }, [addToast, user, updateUser]);

  const data = useMemo(() => {
    interface dataInfo {
      low: string | number;
      max: string | number;
      prec: string | number;
    }
    const d: dataInfo[] = [] as dataInfo[];

    historicConditions.forEach((stationData) => {
      const conditions = stationData.conditions || [] as HistoricConditionsData[];
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
          prec: Number(conditionsOnDay.precipTotal) === 0 ? "" : String(conditionsOnDay.precipTotal).replace(/\./g, ","),
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

      <Container isLoading={isLoading}>
        {isLoading && (
          <LoaderContainer>
            <Loader type='Circles' color='#3b5998' height={100} width={100} />
          </LoaderContainer>
        )}

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
      </Container>
    </>
  );
};

export default Dashboard;
