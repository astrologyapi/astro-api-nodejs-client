/**
 * Quick Start — AstrologyAPI Node.js SDK
 * Run: npx tsx examples/quick-start.ts
 */
import { AstrologyAPI } from "../src/index.js";

const client = new AstrologyAPI({
  userId: process.env["ASTROLOGYAPI_USER_ID"] ?? "YOUR_USER_ID",
  apiKey: process.env["ASTROLOGYAPI_API_KEY"] ?? "YOUR_API_KEY",
});

const birthData = {
  day: 10,
  month: 5,
  year: 1990,
  hour: 19,
  min: 55,
  lat: 19.2,
  lon: 72.83,
  tzone: 5.5,
};

async function main() {
  console.log("── Vedic Birth Details ──────────────────────");
  const details = await client.vedic.getBirthDetails(birthData);
  console.log(details);

  console.log("\n── Vedic D1 (Lagna) Chart ───────────────────");
  const chart = await client.vedic.getChart("D1", birthData);
  console.log(chart);

  console.log("\n── Current Vimshottari Dasha ─────────────────");
  const dasha = await client.vedic.getCurrentDasha(birthData);
  console.log(dasha);

  console.log("\n── Daily Horoscope for Aries ─────────────────");
  const horoscope = await client.horoscopes.getDaily("aries");
  console.log(horoscope);

  console.log("\n── Western Natal Planets ─────────────────────");
  const planets = await client.western.getPlanets(birthData);
  console.log(planets);

  console.log("\n── Lifepath Number ───────────────────────────");
  const lifepath = await client.numerology.getLifepathNumber({
    ...birthData,
    name: "Ravi Sharma",
  });
  console.log(lifepath);

  console.log("\n── Location Lookup ───────────────────────────");
  const places = await client.location.getGeoDetails("Mumbai");
  console.log(places);
}

main().catch(console.error);
