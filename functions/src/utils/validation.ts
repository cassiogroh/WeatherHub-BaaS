import { HttpsError } from "firebase-functions/v2/https";

// Request data comes from the client and can't be trusted: validate it before it
// reaches Firestore paths/queries or the Weather Underground URLs.

// Weather Underground station ids are letters and digits only (e.g. ISANTACA85)
const STATION_ID_REGEX = /^[A-Za-z0-9]{3,20}$/;

// Firestore "in" queries accept at most 30 values
export const MAX_STATIONS_PER_QUERY = 30;

export const parseStationId = (value: unknown): string => {
  if (typeof value !== "string" || !STATION_ID_REGEX.test(value.trim())) {
    throw new HttpsError("invalid-argument", "Invalid station id");
  }

  return value.trim();
};

export const parseStationsIds = (value: unknown, maxLength = MAX_STATIONS_PER_QUERY): string[] => {
  if (!Array.isArray(value) || !value.length || value.length > maxLength) {
    throw new HttpsError("invalid-argument", "Invalid list of station ids");
  }

  return value.map(parseStationId);
};

export const parseText = (value: unknown, field: string, maxLength: number): string => {
  const text = typeof value === "string" ? value.trim() : "";

  if (!text || text.length > maxLength) {
    throw new HttpsError("invalid-argument", `Invalid ${field}`);
  }

  return text;
};

export const parseCoordinate = (value: unknown, field: string, limit: number): number => {
  if (typeof value !== "number" || !Number.isFinite(value) || Math.abs(value) > limit) {
    throw new HttpsError("invalid-argument", `Invalid ${field}`);
  }

  return value;
};
