import * as admin from "firebase-admin";
import { MAX_PAGE_SIZE } from "../constans";

interface FetchDbConditionsProps {
  collection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
  stationsIds: string[];
  maxStationsToFetch: number;
}

export const fetchDbConditions = async <T>({ collection, stationsIds, maxStationsToFetch }: FetchDbConditionsProps) => {
  const fieldPath = admin.firestore.FieldPath;

  // Calculate the page size: If user has limited subscription availability, use it, otherwise use the max page size
  const pageSize = maxStationsToFetch < MAX_PAGE_SIZE ? maxStationsToFetch : MAX_PAGE_SIZE;

  const dbStationsSnapshot = await collection
    .where(fieldPath.documentId(), "in", stationsIds)
    .limit(pageSize)
    .get();

  const dbConditions: T[] = dbStationsSnapshot.docs.map(doc => {
    return {
      ...doc.data() as T,
    };
  });

  return dbConditions;
};
