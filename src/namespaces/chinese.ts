import { HttpClient } from "../http";
import type { BirthData, Language } from "../types";

/**
 * Chinese astrology namespace — Chinese zodiac sign and annual forecast.
 */
export class ChineseNamespace {
  constructor(private readonly http: HttpClient) {}

  private post<T>(endpoint: string, body: Record<string, unknown>, language?: Language): Promise<T> {
    return this.http.post<T>({ endpoint, body, domain: "json", language });
  }

  /**
   * Chinese zodiac sign based on birth year, along with traits and compatibility.
   */
  getZodiac(data: BirthData, language?: Language) {
    return this.post("chinese_zodiac", { ...data }, language);
  }

  /**
   * Chinese year forecast — annual predictions based on the Chinese zodiac sign.
   */
  getYearForecast(data: BirthData, language?: Language) {
    return this.post("chinese_year_forecast", { ...data }, language);
  }
}
