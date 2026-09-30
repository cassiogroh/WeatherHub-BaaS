import { constants } from "./constants";

/**
 * Rebuilds the per-page cache after the stations order changed, reusing the data already loaded.
 * A page is only filled if all of its stations were loaded before; otherwise it is left empty so it gets fetched.
 */
export function repaginateStations<T extends { stationId: string }>(
  pages: Record<string, T[]>,
  orderedIds: string[],
): Record<string, T[]> {
  const { pageSize } = constants;
  const loadedStations = new Map<string, T>();

  Object.values(pages).forEach(page => page.forEach(station => loadedStations.set(station.stationId, station)));

  const newPages = Object.fromEntries(Object.keys(pages).map(page => [page, [] as T[]]));

  for (let page = 0; page * pageSize < orderedIds.length; page++) {
    const stations = orderedIds
      .slice(page * pageSize, (page + 1) * pageSize)
      .map(id => loadedStations.get(id));

    newPages[page] = stations.every(Boolean) ? stations as T[] : [];
  }

  return newPages;
}
