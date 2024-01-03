interface CommonProps {
  stationID: string;
  status: string;
  lastFetchUnix: number;
  conditions: Record<string, string> | Record<string, string>[];
}

interface UpdateStationsDbProps<T extends CommonProps> {
  stations: T[];
  collection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
}

export const updateStationsDb = async <T extends CommonProps>({ stations, collection }: UpdateStationsDbProps<T>) => {
  const batch = collection.firestore.batch();

  stations.forEach(station => {
    const docRef = collection.doc(station.stationID);
    batch.update(docRef, {
      status: station.status,
      lastFetchUnix: station.lastFetchUnix,
      conditions: station.conditions,
    });
  });

  await batch.commit();
};
