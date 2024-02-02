import * as admin from "firebase-admin";

interface FetchDbConditionsProps {
  collection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
  stationsIds: string[];
  maxStationsToFetch: number;
}

export const fetchDbConditions = async <T>({ collection, stationsIds, maxStationsToFetch }: FetchDbConditionsProps) => {
  const fieldPath = admin.firestore.FieldPath;

  // Running in the emulator
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // const fieldPath = require("@google-cloud/firestore").FieldPath;

  // Remove empty strings from the array
  stationsIds = stationsIds.filter(Boolean);

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
