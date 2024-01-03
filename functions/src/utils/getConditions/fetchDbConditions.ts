import { fieldPath } from "../..";
import { MAX_PAGE_SIZE } from "../constans";

interface FetchDbConditionsProps {
  collection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
  stationsIds: string[];
  currentPage: number;
  maxStationsToFetch: number;
}

export const fetchDbConditions = async <T>({ collection, stationsIds, currentPage, maxStationsToFetch }: FetchDbConditionsProps) => {
  // Calculate the page size: If user has limited subscription availability, use it, otherwise use the max page size
  const pageSize = maxStationsToFetch < MAX_PAGE_SIZE ? maxStationsToFetch : MAX_PAGE_SIZE;

  // Get stations from DB
  const startAt = (currentPage - 1) * pageSize;

  const dbStationsSnapshot = await collection
    .where(fieldPath.documentId(), "in", stationsIds)
    .orderBy("order")
    .startAt(startAt)
    .limit(pageSize)
    .get();

  const dbConditions: T[] = dbStationsSnapshot.docs.map(doc => {
    return {
      ...doc.data() as T,
    };
  });

  return dbConditions;
};
