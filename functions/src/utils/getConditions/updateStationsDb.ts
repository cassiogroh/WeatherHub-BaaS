import { StationProps } from "../../models/station";

interface CommonProps extends StationProps {
  conditions: Record<string, string> | Record<string, string>[];
}

interface UpdateStationsDbProps<T extends CommonProps> {
  stations: T[];
  collection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
}

export const updateStationsDb = async <T extends CommonProps>({ stations, collection }: UpdateStationsDbProps<T>) => {
  const batch = collection.firestore.batch();

  stations.forEach(station => {
    if (!station.stationId) return;

    const docRef = collection.doc(station.stationId);
    batch.update(docRef, {
      status: station.status,
      geolocation: station.geolocation,
      observationTimeUTC: station.observationTimeUTC,
      lastFetchUnix: station.lastFetchUnix,
      conditions: station.conditions,
    });
  });

  await batch.commit();
};
