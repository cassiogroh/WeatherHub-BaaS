import { onCall } from "firebase-functions/v2/https";
import { getYear, getMonth, getDate, isAfter, subDays } from 'date-fns';

import { apiInfo, getCurrentConditionsUrl, getHistoricUrl } from "./utils/api_info";
import { StationProps } from "./models/station";
import { User } from "./models/user";
import { firestore } from "./index";

interface LoadStationsProps {
  userId?: string;
  singleStationId?: string;
}

interface RequestProps {
  urlArray: Array<UrlArray>;
  user: User;
}

interface HandleStationsRequestProps {
  user: User;
  singleStationId?: string;
}

interface UrlArray {
  stationID: string;
  urlCurrent: string;
  urlHistoric: string;
}

export const loadStationsFunction = onCall(async (request) => {
  const { userId, singleStationId } = request.data as LoadStationsProps;

  let user = {} as User;
  if (userId) {
    const userSnapshot = await firestore.collection('users').doc(userId).get();
    user = userSnapshot.data() as User;
  }

  const urlArray = await handleStationsRequest({ user, singleStationId });
  const stationsArray = await populateStations({ urlArray, user });

  return stationsArray;
});

const populateStations = (async ({ urlArray, user }: RequestProps) => {
  const unitSystem = apiInfo.units === 'm' ? 'metric' : 'imperial';

  const offlineStations: string[] = [];

  const isQuarterAfterMidnight = () => {
    const now = Date.now();
    const quarterAfterMidnight = new Date(getYear(now), getMonth(now), getDate(now), 0, 15, 0);
    return isAfter(now, quarterAfterMidnight);
  }

  const stationsCurrentData = await Promise.allSettled(
    urlArray.map((urls, index) =>
      fetch(urls.urlCurrent)
        .then(response => response.json())
        .catch(err => offlineStations.push(urlArray[index].stationID))
    )
  )

  let stationsHistoricData = null;
  isQuarterAfterMidnight() &&
  (
    stationsHistoricData = await Promise.allSettled(
      urlArray.map((urls) =>
        fetch(urls.urlHistoric)
          .then(response => {return response.json()})
          .catch(err => console.log('Error fetching historic data: ', err))
      )
    )
  )

  const stationsCurrent: object[] = [];
  let stationsHistoric: object[] = [];

  if (offlineStations.length) {
    var i = 0;
  }

  stationsCurrentData.forEach((data) => {
    let station: StationProps = {} as StationProps;

    if (data.status === 'fulfilled' && isNaN(data.value) ) {
      let {
        dewpt,
        elev,
        heatIndex,
        precipRate,
        precipTotal,
        pressure,
        temp,
        windChill,
        windGust,
        windSpeed
      } = data.value.observations[0][unitSystem];

      let { humidity } = data.value.observations[0]

      station.neighborhood = data.value.observations[0].neighborhood;
      station.stationID = data.value.observations[0].stationID;
      station.url = `http://www.wunderground.com/personal-weather-station/dashboard?ID=${station.stationID}`
      station.dewpt = dewpt || dewpt === 0 ? dewpt.toFixed(1) : '--';
      station.humidity = humidity || humidity === 0 ? humidity.toFixed(1) : '--';
      station.elev = elev || elev === 0 ? elev.toFixed(1) : '--';
      station.heatIndex = heatIndex || heatIndex === 0 ? heatIndex.toFixed(1) : '--';
      station.precipRate = precipRate || precipRate === 0 ? precipRate.toFixed(1) : '--';
      station.precipTotal = precipTotal || precipTotal === 0 ? precipTotal.toFixed(1) : '--';
      station.pressure = pressure || pressure === 0 ? pressure.toFixed(1) : '--';
      station.temp = temp || temp === 0 ? temp.toFixed(1) : '--';
      station.windChill = windChill || windChill === 0 ? windChill.toFixed(1) : '--';
      station.windGust = windGust || windGust === 0 ? windGust.toFixed(1) : '--';
      station.windSpeed = windSpeed || windSpeed === 0 ? windSpeed.toFixed(1) : '--';
      station.status = 'online';

      if (!user.stations) {
        station.name = station.neighborhood;
      } else {
        const stationIndex = user.stations.findIndex(userStationId => userStationId === station.stationID)

        if (stationIndex < 0) {
          throw new Error('Station index does not match');
        }

        if (user.stations === user.stations_names) {
          station.name = station.neighborhood;
        } else {
          station.name = user.stations_names[stationIndex];
        }
      }

      stationsCurrent.push(station);
    } else {
      station.status = 'offline';
      station.stationID = offlineStations[i];
      station.url = `http://www.wunderground.com/personal-weather-station/dashboard?ID=${offlineStations[i]}`

      if (!user.stations) {
        station.name = offlineStations[i];
      } else {
        const stationIndex = user.stations.findIndex(userStationId => userStationId === station.stationID)

        if (stationIndex < 0) {
          throw new Error('Station index does not match');
        }
        station.name = user.stations_names[stationIndex];
      }

      stationsCurrent.push(station);
      i++;
    }
  });

  isQuarterAfterMidnight() && stationsHistoricData ?
  stationsHistoricData.forEach(data => {
    let station: StationProps[] = [] as StationProps[];

    if (data.status === 'fulfilled' && isNaN(data.value) && data.value) {
      
      const indexToReplace: number[] = [];
      const seven_days_ago = subDays(new Date(), 6);

      if (data.value.summaries.length < 7) {
        for (let i = 0; i < data.value.summaries.length - 1; i++) {
          const date1 = new Date(data.value.summaries[i].obsTimeLocal).getDate();
          const date2 = new Date(data.value.summaries[i + 1].obsTimeLocal).getDate();

          if (date2 > date1 + 1) {
            indexToReplace.push(i+1);
          }
        }
      }

      if (new Date(data.value.summaries[0].obsTimeLocal).getDate() !== seven_days_ago.getDate()) {
        indexToReplace.push(0);
      }

      if (new Date(data.value.summaries[data.value.summaries.length - 1].obsTimeLocal).getDate() !== new Date().getDate()) {
        indexToReplace.push(7);
      }

      indexToReplace.length &&
      indexToReplace.forEach(index => {
        data.value.summaries.splice(index, 0, {
          humidityAvg: null,
          humidityHigh: null,
          humidityLow: null,
          metric: {
            dewptAvg: null,
            dewptHigh: null,
            dewptLow: null,
            heatindexAvg: null,
            heatindexHigh: null,
            heatindexLow: null,
            precipRate: null,
            precipTotal: null,
            pressureMax: null,
            pressureMin: null,
            pressureTrend: null,
            tempAvg: null,
            tempHigh: null,
            tempLow: null,
            windchillAvg: null,
            windchillHigh: null,
            windchillLow: null,
            windgustAvg: null,
            windgustHigh: null,
            windgustLow: null,
            windspeedAvg: null,
            windspeedHigh: null,
            windspeedLow: null,
          }
        })
      });

      data.value.summaries.forEach((historicData: any, index: number) => {
        let stationHistoric: StationProps = {} as StationProps;

        let {
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
          precipTotal
        }
        = historicData[unitSystem];

        let {
          humidityLow,
          humidityAvg,
          humidityHigh
        } = historicData;

        stationHistoric.humidityHigh = humidityHigh || humidityHigh === 0 ? humidityHigh.toFixed(1) : '';
        stationHistoric.humidityLow = humidityLow || humidityLow === 0 ? humidityLow.toFixed(1) : '';
        stationHistoric.humidityAvg = humidityAvg || humidityAvg === 0 ? humidityAvg.toFixed(1) : '';
        stationHistoric.tempHigh = tempHigh || tempHigh === 0 ? tempHigh.toFixed(1) : '';
        stationHistoric.tempLow = tempLow || tempLow === 0 ? tempLow.toFixed(1) : '';
        stationHistoric.tempAvg = tempAvg || tempAvg === 0 ? tempAvg.toFixed(1) : '';
        stationHistoric.windspeedHigh = windspeedHigh || windspeedHigh === 0 ? windspeedHigh.toFixed(1) : '';
        stationHistoric.windspeedLow = windspeedLow || windspeedLow === 0 ? windspeedLow.toFixed(1) : '';
        stationHistoric.windspeedAvg = windspeedAvg || windspeedAvg === 0 ? windspeedAvg.toFixed(1) : '';
        stationHistoric.windgustHigh = windgustHigh || windgustHigh === 0 ? windgustHigh.toFixed(1) : '';
        stationHistoric.windgustLow = windgustLow || windgustLow === 0 ? windgustLow.toFixed(1) : '';
        stationHistoric.windgustAvg = windgustAvg || windgustAvg === 0 ? windgustAvg.toFixed(1) : '';
        stationHistoric.dewptHigh = dewptHigh || dewptHigh === 0 ? dewptHigh.toFixed(1) : '';
        stationHistoric.dewptLow = dewptLow || dewptLow === 0 ? dewptLow.toFixed(1) : '';
        stationHistoric.dewptAvg = dewptAvg || dewptAvg === 0 ? dewptAvg.toFixed(1) : '';
        stationHistoric.windchillHigh = windchillHigh || windchillHigh === 0 ? windchillHigh.toFixed(1) : '';
        stationHistoric.windchillLow = windchillLow || windchillLow === 0 ? windchillLow.toFixed(1) : '';
        stationHistoric.windchillAvg = windchillAvg || windchillAvg === 0 ? windchillAvg.toFixed(1) : '';
        stationHistoric.heatindexHigh = heatindexHigh || heatindexHigh === 0 ? heatindexHigh.toFixed(1) : '';
        stationHistoric.heatindexLow = heatindexLow || heatindexLow === 0 ? heatindexLow.toFixed(1) : '';
        stationHistoric.heatindexAvg = heatindexAvg || heatindexAvg === 0 ? heatindexAvg.toFixed(1) : '';
        stationHistoric.pressureMax = pressureMax || pressureMax === 0 ? pressureMax.toFixed(1) : '';
        stationHistoric.pressureMin = pressureMin || pressureMin === 0 ? pressureMin.toFixed(1) : '';
        stationHistoric.precipTotalHistoric = precipTotal || precipTotal === 0 ? precipTotal.toFixed(1) : '';

        station.push(stationHistoric);
      })

      stationsHistoric.push(station);
      
    } else {
      let stationHistoric: StationProps = {} as StationProps;

      for (let index = 0; index < 7; index++) {
        stationHistoric.humidityHigh = '';
        stationHistoric.humidityLow = '';
        stationHistoric.humidityAvg = '';
        stationHistoric.tempHigh = '';
        stationHistoric.tempLow = '';
        stationHistoric.tempAvg = '';
        stationHistoric.windspeedHigh = '';
        stationHistoric.windspeedLow = '';
        stationHistoric.windspeedAvg = '';
        stationHistoric.windgustHigh = '';
        stationHistoric.windgustLow = '';
        stationHistoric.windgustAvg = '';
        stationHistoric.dewptHigh = '';
        stationHistoric.dewptLow = '';
        stationHistoric.dewptAvg = '';
        stationHistoric.windchillHigh = '';
        stationHistoric.windchillLow = '';
        stationHistoric.windchillAvg = '';
        stationHistoric.heatindexHigh = '';
        stationHistoric.heatindexLow = '';
        stationHistoric.heatindexAvg = '';
        stationHistoric.pressureMax = '';
        stationHistoric.pressureMin = '';
        stationHistoric.precipTotalHistoric = '';

        station.push(stationHistoric);
      }

      stationsHistoric.push(station);
    }
  })
  : stationsHistoric = [{...Array(stationsCurrent.length).keys()}];

  return { stationsCurrent, stationsHistoric };
});

const handleStationsRequest = async ({ user, singleStationId}: HandleStationsRequestProps): Promise<UrlArray[]> => {
  const urlArray: UrlArray[] = [];

  if (user.stations) {
    // Grabing data for user page
    let userStations: string | string[];

    if (!singleStationId) {
      userStations = user.stations;

      for (let i = 0; i < userStations.length; i++) {
        urlArray[i] = {
          stationID: userStations[i],
          urlCurrent: getCurrentConditionsUrl(userStations[i]),
          urlHistoric: getHistoricUrl(userStations[i])
        }
      }

    } else { // used when adding a station to dashboard
      userStations = user.stations[user.stations.length-1];

      urlArray[0] = {
        stationID: singleStationId,
        urlCurrent: getCurrentConditionsUrl(singleStationId),
          urlHistoric: getHistoricUrl(singleStationId)
      }
    }
  } else {
    // Grabing data for home page
    for (let i = 0; i < apiInfo.stationsId.length; i++) {
      urlArray[i] = {
        stationID: apiInfo.stationsId[i],
        urlCurrent: getCurrentConditionsUrl(apiInfo.stationsId[i]),
        urlHistoric: getHistoricUrl(apiInfo.stationsId[i])
      }
    }
  }

  return urlArray;
}