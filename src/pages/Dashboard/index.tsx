import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Loader from "react-loader-spinner";

import ProfileHeader from "../../components/ProfileHeader";
import StationCard, { ViewProps } from "../../components/StationCard";
import ToggleStats from "../../components/ToggleStats";

import { useAuth } from "../../hooks/auth";
import { useToast } from "../../hooks/toast";
import { callableFunction } from "../../services/api";
import { cloudFunctions } from "../../services/cloudFunctions";
import { registerError } from "../../functions/registerError";
import { constants } from "../../utils/constants";
import { copyHistoricData } from "../../utils/copyHistoricData";
import { CurrentConditions, HistoricConditions } from "../../models/station";

import { Container, LoaderContainer, PaginationButton, PaginationWrapper, StationsStats } from "./styles";

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [ currentConditions, setCurrentConditions ] = useState([] as CurrentConditions[]);
  const [ historicConditions, setHistoricConditions ] = useState([] as HistoricConditions[]);
  const [ inputValue, setInputValue ] = useState("");
  const [ isLoading, setIsLoading ] = useState(false);

  // ToggleStats component
  const [ toggleInputSlider, setToggleInputSlider ] = useState(false);
  const [ currentHistoricDay, setCurrentHistoricDay ] = useState(0);
  const [ minStatus, setMinStatus ] = useState(true);
  const [ medStatus, setMedStatus ] = useState(false);
  const [ maxStatus, setMaxStatus ] = useState(true);
  const [ currentPage, setCurrentPage ] = useState(1);
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

  const currentDataView = useMemo(() => {
    return toggleInputSlider ? historicConditions : currentConditions;
  }, [currentConditions, historicConditions, toggleInputSlider]);

  const { idsPerPage, pagesArray } = useMemo(() => {
    if (!user) return { idsPerPage: {}, pagesArray: [] };
    const { pageSize } = constants;

    const stations = user.wuStations || [];

    stations.sort((a, b) => a.order - b.order);

    const stationsLength = stations.length;

    const totalPages = Math.ceil(stationsLength / pageSize);

    const idsObject = {} as { [key: number]: string[] };

    for (let index = 1; index <= totalPages; index++) {
      const sliceStart = (index - 1) * pageSize;
      const sliceEnd = index * pageSize;
      const ids = stations
        .slice(sliceStart, sliceEnd)
        .map(station => station.id);

      idsObject[index] = ids;
    }

    const pages = [...new Array(totalPages)].map((_, index) => {
      const page = index + 1;

      return page;
    });

    return { idsPerPage: idsObject, pagesArray: pages };
  }, [user]);

  const sortStationsByOrder = useCallback((dataToSort: any[]) => {
    const sortedData = dataToSort.sort((a, b) => {
      // Find the corresponding user station for each data item
      const userStationA = user.wuStations.find(station => station.id === a.stationId);
      const userStationB = user.wuStations.find(station => station.id === b.stationId);

      // If we couldn't find a user station, sort the item to the end
      if (!userStationA) return 1;
      if (!userStationB) return -1;

      // Sort by the order property
      return userStationA.order - userStationB.order;
    });

    return sortedData;
  }, [user.wuStations]);

  const getCurrentConditions = useCallback(async (userId: string, stationsIds: string[]) => {
    setIsLoading(true);
    try {
      const data = await callableFunction(
        cloudFunctions.getCurrentConditions,
        { userId, stationsIds },
      );

      const currentData = data.currentConditions as CurrentConditions[];

      const sortedData: CurrentConditions[] = sortStationsByOrder(currentData);

      setCurrentConditions(sortedData);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      registerError(error, user);
      setIsLoading(false);
    }
  }, [sortStationsByOrder, user]);

  const getHistoricConditions = useCallback(async (userId: string, stationsIds: string[]) => {
    setIsLoading(true);
    try {
      const data = await callableFunction(
        cloudFunctions.getHistoricalConditions,
        { userId, stationsIds },
      );

      const historicData = data.historicConditions as HistoricConditions[];

      const sortedData: HistoricConditions[] = sortStationsByOrder(historicData);

      setHistoricConditions(sortedData);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      registerError(error, user);
      setIsLoading(false);
    }
  }, [sortStationsByOrder, user]);

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

  const handleChangePage = useCallback((page: number) => {
    setCurrentPage(page);

    const stationsIds = idsPerPage[page];

    if (toggleInputSlider) {
      getHistoricConditions(user.userId, stationsIds);
    } else {
      getCurrentConditions(user.userId, stationsIds);
    }
  }, [getCurrentConditions, getHistoricConditions, idsPerPage, toggleInputSlider, user]);

  const toggleConditions = useCallback((newToggleValue) => {
    setToggleInputSlider(newToggleValue);

    const hasSetToHistoricData = newToggleValue;

    const userId = user.userId;
    const stationsIds = idsPerPage[currentPage];

    if (hasSetToHistoricData) {
      getHistoricConditions(userId, stationsIds);
    } else {
      getCurrentConditions(userId, stationsIds);
    }
  }, [currentPage, getCurrentConditions, getHistoricConditions, idsPerPage, user.userId]);

  const copyData = useCallback(() => {
    const copiedSuccessfully = copyHistoricData({ historicConditions, currentHistoricDay });

    if (copiedSuccessfully) {
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
  }, [historicConditions, currentHistoricDay, addToast]);

  useEffect(() => {
    const userId = user.userId;

    if (!userId) return;

    // Get first 15 stations ids
    const stationsIds = user.wuStations
      .slice(0, constants.pageSize)
      .map(station => station.id);

    if (!stationsIds.length) {
      return;
    }

    getCurrentConditions(userId, stationsIds);
  }, [user, getCurrentConditions]);

  return (
    <>
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
          setToggleInputSlider={toggleConditions}
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
          {currentDataView.map((station, index: number) => (
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

        {pagesArray.length > 1 && (
          <PaginationWrapper>
            {pagesArray.map(pageNumber => (
              <PaginationButton
                key={pageNumber}
                onClick={() => handleChangePage(pageNumber)}
                disabled={pageNumber === currentPage}
                title={pageNumber === currentPage
                  ? `Vendo estações da página ${pageNumber}`
                  : `Ver estações da página ${pageNumber}`
                }
              >
                {pageNumber}
              </PaginationButton>
            ))}

          </PaginationWrapper>
        )}
      </Container>
    </>
  );
};

export default Dashboard;
