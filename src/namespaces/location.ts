import { HttpClient } from "../http";
import type { Language } from "../types";

/**
 * Location namespace — geographic lookup and timezone resolution.
 *
 * Use these endpoints before making birth chart calls when you only
 * have a place name (not coordinates) and need to resolve lat/lon/tzone.
 */
export class LocationNamespace {
  constructor(private readonly http: HttpClient) {}

  private post<T>(endpoint: string, body: Record<string, unknown>, language?: Language): Promise<T> {
    return this.http.post<T>({ endpoint, body, domain: "json", language });
  }

  /**
   * Resolve geographic coordinates (lat, lon) from a place name.
   *
   * @param place - Place name to search (e.g. "Mumbai", "New York")
   * @param maxRows - Maximum number of results to return (default: 6)
   *
   * @example
   * const results = await client.location.getGeoDetails("Mumbai");
   * // Use results[0].latitude and results[0].longitude for birth chart calls
   */
  getGeoDetails(place: string, maxRows = 6, language?: Language) {
    return this.post("geo_details", { place, maxRows }, language);
  }

  /**
   * Get the UTC timezone offset for a location and date, accounting for DST.
   *
   * Returns the `tzone` value (e.g. 5.5 for IST, -5.0 for EST) to use
   * in birth chart requests.
   *
   * @example
   * const tz = await client.location.getTimezone({
   *   day: 15, month: 6, year: 1990,
   *   hour: 10, min: 30,
   *   lat: 28.61, lon: 77.20,
   * });
   */
  getTimezone(
    data: {
      day: number;
      month: number;
      year: number;
      hour: number;
      min: number;
      lat: number;
      lon: number;
    },
    language?: Language,
  ) {
    return this.post("timezone_with_dst", { ...data }, language);
  }
}
