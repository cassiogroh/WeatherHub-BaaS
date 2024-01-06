import * as admin from "firebase-admin";

interface FetchDbConditionsProps {
  collection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
  stationsIds: string[];
  maxStationsToFetch: number;
}

export const fetchDbConditions = async <T>({ collection, stationsIds, maxStationsToFetch }: FetchDbConditionsProps) => {
  const fieldPath = admin.firestore.FieldPath;

  const dbStationsSnapshot = await collection
    .where(fieldPath.documentId(), "in", stationsIds)
    .limit(maxStationsToFetch)
    .get();

  const dbConditions: T[] = dbStationsSnapshot.docs.map(doc => {
    return {
      ...doc.data() as T,
    };
  });

  return dbConditions;
};
