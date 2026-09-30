import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Loader from "react-loader-spinner";
import { FiX } from "react-icons/fi";

import ProfileHeader from "../../components/ProfileHeader";
import StationCard, { ViewProps } from "../../components/StationCard";
import ToggleStats from "../../components/ToggleStats";
import ReorderStations from "../../components/ReorderStations";
import SortStations from "../../components/SortStations";

import { useAuth } from "../../hooks/auth";
import { useToast } from "../../hooks/toast";
import { callableFunction } from "../../services/api";
import { cloudFunctions } from "../../services/cloudFunctions";
import { registerError } from "../../functions/registerError";
import { constants } from "../../utils/constants";
import { copyHistoricData } from "../../utils/copyHistoricData";
import { repaginateStations } from "../../utils/repaginateStations";
import {
  SortDirection,
  findRankingMetric,
  getSortGroups,
  isRankingMetricVisible,
  rankStations,
} from "../../utils/stationSorting";
import { CurrentConditions, HistoricConditions } from "../../models/station";

import { Container, LoaderContainer, PaginationButton, PaginationWrapper, RankingBar, StationsStats } from "./styles";

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const mockObject = {
    "0": [],
    "1": [],
    "2": [],
    "3": [],
    "4": [],
    "5": [],
    "6": [],
    "7": [],
    "8": [],
    "9": [],
    "10": [],
  };

  const [ currentConditions, setCurrentConditions ] = useState(mockObject as Record<string, CurrentConditions[]>);
  const [ historicConditions, setHistoricConditions ] = useState(mockObject as Record<string, HistoricConditions[]>);
  const [ inputValue, setInputValue ] = useState("");
  const [ isLoading, setIsLoading ] = useState(false);
  const [ isReordering, setIsReordering ] = useState(false);
  const orderChangedRef = useRef(false);
  const [ sortKey, setSortKey ] = useState(""); // "" keeps the dashboard order
  const [ sortDirection, setSortDirection ] = useState<SortDirection>("desc");

  // ToggleStats component
  const [ toggleInputSlider, setToggleInputSlider ] = useState(false);
  const [ currentHistoricDay, setCurrentHistoricDay ] = useState(0);
  const [ minStatus, setMinStatus ] = useState(true);
  const [ medStatus, setMedStatus ] = useState(false);
  const [ maxStatus, setMaxStatus ] = useState(true);
  const [ currentPage, setCurrentPage ] = useState(0);
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

      idsObject[index - 1] = ids;
    }

    const pages = [...new Array(totalPages)].map((_, index) => {
      const page = index;
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

  const getCurrentConditions = useCallback(async (userId: string, stationsIds: string[], page: number, force = false) => {
    if (!force && currentConditions[page].length) return;

    setIsLoading(true);
    try {
      const data = await callableFunction(
        cloudFunctions.getCurrentConditions,
        { userId, stationsIds },
      );

      const currentData = data.currentConditions as CurrentConditions[];

      const sortedData: CurrentConditions[] = sortStationsByOrder(currentData);

      setCurrentConditions(state => {
        const stateCopy = { ...state };
        stateCopy[page] = sortedData;

        return stateCopy;
      });
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      registerError(error, user);
      setIsLoading(false);
    }
  }, [sortStationsByOrder, user, currentConditions]);

  const getHistoricConditions = useCallback(async (userId: string, stationsIds: string[], page: number, force = false) => {
    if (!force && historicConditions[page].length) return;

    setIsLoading(true);
    try {
      const data = await callableFunction(
        cloudFunctions.getHistoricalConditions,
        { userId, stationsIds },
      );

      const historicData = data.historicConditions as HistoricConditions[];

      const sortedData: HistoricConditions[] = sortStationsByOrder(historicData);

      setHistoricConditions(state => {
        const stateCopy = { ...state };
        stateCopy[page] = sortedData;
        return stateCopy;
      });
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      registerError(error, user);
      setIsLoading(false);
    }
  }, [historicConditions, sortStationsByOrder, user]);

  const sortedStations = useMemo(() => {
    return [...(user.wuStations || [])].sort((a, b) => a.order - b.order);
  }, [user.wuStations]);

  // Rebuilds the pages after stations changed position (reorder or delete), reusing the loaded data,
  // so every page keeps 12 stations: e.g. the first station of page 2 moves up to page 1
  const applyStationsOrder = useCallback(async (orderedIds: string[]) => {
    const { pageSize } = constants;
    const lastPage = Math.max(Math.ceil(orderedIds.length / pageSize) - 1, 0);
    const page = Math.min(currentPage, lastPage); // the last page may be gone after a delete

    const newCurrentConditions = repaginateStations(currentConditions, orderedIds);
    const newHistoricConditions = repaginateStations(historicConditions, orderedIds);

    setCurrentConditions(newCurrentConditions);
    setHistoricConditions(newHistoricConditions);
    setCurrentPage(page);

    // Fetch the page being viewed if a station that wasn't loaded yet moved into it
    const stationsIds = orderedIds.slice(page * pageSize, (page + 1) * pageSize);

    if (!stationsIds.length) return;

    if (toggleInputSlider && !newHistoricConditions[page]?.length) {
      await getHistoricConditions(user.userId, stationsIds, page, true);
    } else if (!toggleInputSlider && !newCurrentConditions[page]?.length) {
      await getCurrentConditions(user.userId, stationsIds, page, true);
    }
  }, [
    currentPage,
    currentConditions,
    historicConditions,
    toggleInputSlider,
    getCurrentConditions,
    getHistoricConditions,
    user.userId,
  ]);

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

      // New list (not a mutation) so the pages and the reorder view update
      updateUser({ ...user, wuStations: user.wuStations.filter(({ id }) => id !== stationId) });

      // The stations after it move up a position
      if (isReordering) {
        // Remove it from the loaded pages now, rebuild them when leaving the reorder view
        const removeStation = <T extends { stationId: string }>(state: Record<string, T[]>) => Object.fromEntries(
          Object.entries(state).map(([page, stations]) => [page, stations.filter(station => station.stationId !== stationId)]),
        );

        setCurrentConditions(removeStation);
        setHistoricConditions(removeStation);
        orderChangedRef.current = true;
      } else {
        await applyStationsOrder(sortedStations.map(({ id }) => id).filter(id => id !== stationId));
      }

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
  }, [addToast, user, updateUser, isReordering, applyStationsOrder, sortedStations]);

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

      const newStationIndex = user.wuStations.length;

      // New user object (not a mutation) so idsPerPage/pagesArray are recomputed
      updateUser({
        ...user,
        wuStations: [...user.wuStations, {
          id: stationId,
          order: newStationIndex,
          createdAt: Date.now(),
          name: data.currentConditions.neighborhood,
        }],
      });

      // The new station always goes at the end, on the last page
      const targetPage = Math.floor(newStationIndex / constants.pageSize);
      const startsNewPage = newStationIndex % constants.pageSize === 0;

      // Only touch a page that is already loaded, or a brand new page holding just this station.
      // A page that exists but wasn't loaded yet stays empty, so it is fetched (with the new station) when opened.
      // Copy arrays instead of pushing: StrictMode runs updaters twice in development.
      const addToPage = <T,>(state: Record<string, T[]>, station: T) => {
        const pageStations = state[targetPage] || [];

        if (!startsNewPage && !pageStations.length) return state;

        return { ...state, [targetPage]: [...pageStations, station] };
      };

      setCurrentConditions(state => addToPage(state, data.currentConditions));
      setHistoricConditions(state => addToPage(state, data.historicConditions));
      setIsLoading(false);
    } catch {
      addToast({
        type: "error",
        title: "ID inválido",
        description: "A estação não existe ou está temporariamente offline.",
      });
    }

    setIsLoading(false);
  }, [user, addToast, updateUser]);

  const handleChangePage = useCallback((page: number) => {
    setCurrentPage(page);

    const stationsIds = idsPerPage[page];

    if (toggleInputSlider) {
      getHistoricConditions(user.userId, stationsIds, page);
    } else {
      getCurrentConditions(user.userId, stationsIds, page);
    }
  }, [getCurrentConditions, getHistoricConditions, idsPerPage, toggleInputSlider, user]);

  const toggleConditions = useCallback((newToggleValue) => {
    setToggleInputSlider(newToggleValue);
    setSortKey(""); // current and historic data have different metrics

    const hasSetToHistoricData = newToggleValue;

    const userId = user.userId;
    const stationsIds = idsPerPage[currentPage];

    if (hasSetToHistoricData) {
      getHistoricConditions(userId, stationsIds, currentPage);
    } else {
      getCurrentConditions(userId, stationsIds, currentPage);
    }
  }, [currentPage, getCurrentConditions, getHistoricConditions, idsPerPage, user.userId]);

  const handleReorderStations = useCallback(async (stationsIds: string[]) => {
    // Only apply the new order once it's saved. The loader blocks the page, so saves never overlap
    setIsLoading(true);

    try {
      await callableFunction(cloudFunctions.reorderStations, { stationsIds });

      const stationsById = new Map(user.wuStations.map(station => [station.id, station]));

      updateUser({
        ...user,
        wuStations: stationsIds.map((id, order) => ({ ...stationsById.get(id) as typeof user.wuStations[number], order })),
      });
      orderChangedRef.current = true;
    } catch {
      addToast({
        type: "error",
        title: "Erro ao salvar a ordem",
        description: "A ordem das estações não foi alterada. Tente novamente.",
      });
    }

    setIsLoading(false);
  }, [user, updateUser, addToast]);

  const handleToggleReorder = useCallback((reorder: boolean) => {
    setIsReordering(reorder);
    if (reorder) setSortKey(""); // the reorder view shows the saved order

    if (reorder || !orderChangedRef.current) return;
    orderChangedRef.current = false;

    applyStationsOrder(sortedStations.map(station => station.id));
  }, [sortedStations, applyStationsOrder]);

  const historicDayIndex = currentHistoricDay + 6;

  const visibility = useMemo(() => ({
    historic: toggleInputSlider,
    propsView,
    minStatus,
    medStatus,
    maxStatus,
  }), [toggleInputSlider, propsView, minStatus, medStatus, maxStatus]);

  // Every metric, the ones visible on the cards first
  const sortGroups = useMemo(() => getSortGroups(visibility), [visibility]);

  // Stop ranking if the user hides its metric from the cards
  useEffect(() => {
    if (sortKey && !isRankingMetricVisible(sortKey, visibility)) setSortKey("");
  }, [sortKey, visibility]);

  // Ranking covers every station, so load the pages that weren't opened yet
  const loadAllPages = useCallback(async (historic: boolean) => {
    const loadedPages = historic ? historicConditions : currentConditions;
    const missingPages = pagesArray.filter(page => !loadedPages[page]?.length && idsPerPage[page]?.length);

    if (!missingPages.length) return;

    setIsLoading(true);

    try {
      // One page at a time: every call updates the shared API key usage
      for (const page of missingPages) {
        const stationsIds = idsPerPage[page];

        if (historic) {
          const data = await callableFunction(cloudFunctions.getHistoricalConditions, { stationsIds });
          const pageStations: HistoricConditions[] = sortStationsByOrder(data.historicConditions);

          setHistoricConditions(state => ({ ...state, [page]: pageStations }));
        } else {
          const data = await callableFunction(cloudFunctions.getCurrentConditions, { stationsIds });
          const pageStations: CurrentConditions[] = sortStationsByOrder(data.currentConditions);

          setCurrentConditions(state => ({ ...state, [page]: pageStations }));
        }
      }
    } catch (error) {
      console.log(error);
      registerError(error, user);
      addToast({
        type: "error",
        title: "Erro ao carregar estações",
        description: "A ordenação pode não incluir todas as estações.",
      });
    }

    setIsLoading(false);
  }, [historicConditions, currentConditions, pagesArray, idsPerPage, sortStationsByOrder, user, addToast]);

  const handleChangeSortKey = useCallback((newSortKey: string) => {
    const metric = findRankingMetric(toggleInputSlider, newSortKey);

    // Show the ranked value on the cards if it was hidden
    if (metric) {
      setPropsView(view => ({ ...view, [metric.view]: true }));

      if (metric.stat === "min") setMinStatus(true);
      if (metric.stat === "med") setMedStatus(true);
      if (metric.stat === "max") setMaxStatus(true);
    }

    setSortKey(newSortKey);
    setCurrentPage(0); // show the top of the ranking

    if (newSortKey) loadAllPages(toggleInputSlider);
  }, [loadAllPages, toggleInputSlider]);

  const handleToggleSortDirection = useCallback(() => {
    setSortDirection(direction => (direction === "desc" ? "asc" : "desc"));
    setCurrentPage(0);
  }, []);

  const rankedStations = useMemo(() => {
    if (!sortKey) return null;

    const stations = pagesArray.flatMap(page => (currentDataView[page] || []) as (CurrentConditions | HistoricConditions)[]);

    return rankStations({ stations, sortKey, direction: sortDirection, historicDayIndex });
  }, [sortKey, sortDirection, historicDayIndex, pagesArray, currentDataView]);

  const displayedStations: (CurrentConditions | HistoricConditions)[] = rankedStations
    ? rankedStations.slice(currentPage * constants.pageSize, (currentPage + 1) * constants.pageSize)
    : currentDataView[currentPage];

  // Cards are matched with their historic data by id, since a sorted page mixes stations from every page
  const historicById = useMemo(() => {
    return new Map(Object.values(historicConditions).flat().map(station => [station.stationId, station]));
  }, [historicConditions]);

  const showSortControl = !isReordering && (user.wuStations?.length || 0) > 1;
  const rankingLabel = findRankingMetric(toggleInputSlider, sortKey)?.label;

  const copyData = useCallback(() => {
    const copiedSuccessfully = copyHistoricData({ historicConditions: historicConditions[currentPage], currentHistoricDay });

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
  }, [historicConditions, currentPage, currentHistoricDay, addToast]);

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

    getCurrentConditions(userId, stationsIds, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
          propsView={propsView}
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
          isReordering={isReordering}
          setIsReordering={handleToggleReorder}
          sortControl={showSortControl && (
            <SortStations
              groups={sortGroups}
              sortKey={sortKey}
              direction={sortDirection}
              onChangeSortKey={handleChangeSortKey}
              onToggleDirection={handleToggleSortDirection}
            />
          )}
        />

        {isReordering ? (
          <ReorderStations
            stations={sortedStations}
            onReorder={handleReorderStations}
            onDelete={handleDeleteStation}
          />
        ) : (
          <>
            {rankedStations && (
              <RankingBar>
                <p>
                  Ranking por <strong>{rankingLabel}</strong>
                  {" · "}
                  {sortDirection === "desc" ? "maior para menor" : "menor para maior"}
                </p>

                <button type='button' onClick={() => handleChangeSortKey("")}>
                  <FiX size={16} />
                  Limpar ranking
                </button>
              </RankingBar>
            )}

            <StationsStats $hasRankingBar={!!rankedStations}>
              {displayedStations.map((station, index: number) => (
                <StationCard
                  key={station.stationId}
                  currentData={station as CurrentConditions}
                  historicData={toggleInputSlider
                    ? station as HistoricConditions
                    : historicById.get(station.stationId) || { conditions: [] } as unknown as HistoricConditions
                  }
                  propsView={station.status === "online" ? propsView : undefined}
                  handleDeleteStation={handleDeleteStation}
                  currentOrHistoric={toggleInputSlider}
                  minStatus={minStatus}
                  medStatus={medStatus}
                  maxStatus={maxStatus}
                  currentHistoricDay={historicDayIndex}
                  rank={rankedStations ? currentPage * constants.pageSize + index + 1 : undefined}
                  highlightedMetric={sortKey || undefined}
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
                      ? `Vendo estações da página ${pageNumber + 1}`
                      : `Ver estações da página ${pageNumber + 1}`
                    }
                  >
                    {pageNumber + 1}
                  </PaginationButton>
                ))}

              </PaginationWrapper>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default Dashboard;
