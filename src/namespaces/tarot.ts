import { HttpClient } from "../http.js";
import type { Language } from "../types.js";

/**
 * Tarot namespace — tarot card readings.
 */
export class TarotNamespace {
  constructor(private readonly http: HttpClient) {}

  private post<T>(endpoint: string, body: Record<string, unknown>, language?: Language): Promise<T> {
    return this.http.post<T>({ endpoint, body, domain: "json", language });
  }

  /**
   * General tarot card reading — draws cards and provides interpretations
   * for past, present, and future.
   */
  getPredictions(language?: Language) {
    return this.post("tarot_predictions", {}, language);
  }

  /**
   * Yes / No tarot reading — a single card draw with a clear yes or no answer.
   */
  getYesNo(language?: Language) {
    return this.post("yes_no_tarot", {}, language);
  }
}
