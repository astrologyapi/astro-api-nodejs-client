import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ResolvedAuthStyle, TestCredentials } from "./models.js";
import { ROOT_DIR } from "./paths.js";

export async function loadLocalEnv(): Promise<void> {
  const envPath = join(ROOT_DIR, ".env");

  try {
    const raw = await readFile(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const equalsIndex = trimmed.indexOf("=");
      if (equalsIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, equalsIndex).trim();
      const value = trimmed.slice(equalsIndex + 1).trim().replace(/^['"]|['"]$/g, "");

      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    // A local .env file is optional; callers can still rely on process.env.
  }
}

export function inferResolvedAuthStyle(apiKey: string): ResolvedAuthStyle {
  return apiKey.includes("ak-") ? "header" : "basic";
}

export function getCompareCount(): number {
  const raw = Number.parseInt(process.env["ASTROLOGYAPI_TEST_COMPARE_COUNT"] ?? "8", 10);
  if (Number.isNaN(raw) || raw <= 0) {
    return 8;
  }
  return raw;
}

export function getTestCredentials(): TestCredentials {
  const userId = process.env["ASTROLOGYAPI_USER_ID"]?.trim();
  const apiKey = process.env["ASTROLOGYAPI_API_KEY"]?.trim();

  if (!userId || !apiKey) {
    throw new Error(
      "Missing AstrologyAPI credentials. Set ASTROLOGYAPI_USER_ID and ASTROLOGYAPI_API_KEY in the environment or .env file.",
    );
  }

  return { userId, apiKey };
}

export function getTimestampLabel(date = new Date()): string {
  return date.toISOString();
}
