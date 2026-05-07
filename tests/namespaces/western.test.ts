import { afterEach, describe, expect, it, vi } from "vitest";
import { AstrologyAPI } from "../../src/index.js";
import { mumbai, coupleData, stubFetch } from "../fixtures.js";

const client = new AstrologyAPI({ userId: "u", apiKey: "k" });
const ok = () => stubFetch({ body: { ok: true } });

afterEach(() => vi.unstubAllGlobals());

describe("western namespace", () => {
  // ── Core Birth Chart ──────────────────────────────────────────────────────
  it("getPlanets posts to planets/tropical", async () => {
    const mock = ok();
    await client.western.getPlanets(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("planets/tropical");
  });

  it("getHouseCusps posts to house_cusps/tropical", async () => {
    const mock = ok();
    await client.western.getHouseCusps(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("house_cusps/tropical");
  });

  it("getHoroscope posts to western_horoscope", async () => {
    const mock = ok();
    await client.western.getHoroscope(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("western_horoscope");
  });

  it("getNatalWheelChart posts to natal_wheel_chart", async () => {
    const mock = ok();
    await client.western.getNatalWheelChart(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("natal_wheel_chart");
  });

  it("getNatalInterpretation posts to natal_chart_interpretation", async () => {
    const mock = ok();
    await client.western.getNatalInterpretation(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("natal_chart_interpretation");
  });

  // ── House Reports ─────────────────────────────────────────────────────────
  it("getHouseCuspsReport posts to house_cusps_report/tropical", async () => {
    const mock = ok();
    await client.western.getHouseCuspsReport(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("house_cusps_report/tropical");
  });

  it("getNatalHouseCuspReport posts to natal_house_cusp_report", async () => {
    const mock = ok();
    await client.western.getNatalHouseCuspReport(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("natal_house_cusp_report");
  });

  it("getAscendantReport posts to general_ascendant_report/tropical", async () => {
    const mock = ok();
    await client.western.getAscendantReport(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("general_ascendant_report/tropical");
  });

  it("getSignReport posts to general_sign_report/tropical/:planet", async () => {
    const mock = ok();
    await client.western.getSignReport("venus", mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("general_sign_report/tropical/venus");
  });

  it("getHouseReport posts to general_house_report/tropical/:planet", async () => {
    const mock = ok();
    await client.western.getHouseReport("mars", mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("general_house_report/tropical/mars");
  });

  // ── Moon ──────────────────────────────────────────────────────────────────
  it("getMoonPhase posts to moon_phase_report", async () => {
    const mock = ok();
    await client.western.getMoonPhase(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("moon_phase_report");
  });

  it("getLunarMetrics posts to lunar_metrics", async () => {
    const mock = ok();
    await client.western.getLunarMetrics(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("lunar_metrics");
  });

  // ── Solar Return ──────────────────────────────────────────────────────────
  it("getSolarReturnDetails posts to solar_return_details", async () => {
    const mock = ok();
    await client.western.getSolarReturnDetails(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("solar_return_details");
  });

  it("getSolarReturnPlanets posts to solar_return_planets", async () => {
    const mock = ok();
    await client.western.getSolarReturnPlanets(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("solar_return_planets");
  });

  it("getSolarReturnHouseCusps posts to solar_return_house_cusps", async () => {
    const mock = ok();
    await client.western.getSolarReturnHouseCusps(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("solar_return_house_cusps");
  });

  it("getSolarReturnPlanetReport posts to solar_return_planet_report", async () => {
    const mock = ok();
    await client.western.getSolarReturnPlanetReport(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("solar_return_planet_report");
  });

  it("getSolarReturnPlanetAspects posts to solar_return_planet_aspects", async () => {
    const mock = ok();
    await client.western.getSolarReturnPlanetAspects(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("solar_return_planet_aspects");
  });

  it("getSolarReturnAspectsReport posts to solar_return_aspects_report", async () => {
    const mock = ok();
    await client.western.getSolarReturnAspectsReport(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("solar_return_aspects_report");
  });

  // ── Personality & Life Reports ─────────────────────────────────────────────
  it("getPersonality posts to personality_report/tropical", async () => {
    const mock = ok();
    await client.western.getPersonality(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("personality_report/tropical");
  });

  it("getRomanticPersonality posts to romantic_personality_report/tropical", async () => {
    const mock = ok();
    await client.western.getRomanticPersonality(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("romantic_personality_report/tropical");
  });

  it("getFriendship posts to friendship_report/tropical", async () => {
    const mock = ok();
    await client.western.getFriendship(coupleData);
    expect((mock.mock.calls[0] as [string])[0]).toContain("friendship_report/tropical");
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body).toHaveProperty("p_day", 10);
    expect(body).toHaveProperty("s_day", 15);
  });

  it("getRomanticForecast posts to romantic_forecast_report/tropical", async () => {
    const mock = ok();
    await client.western.getRomanticForecast(mumbai);
    expect((mock.mock.calls[0] as [string])[0]).toContain("romantic_forecast_report/tropical");
  });

  it("getKarmaDestiny posts to karma_destiny_report/tropical", async () => {
    const mock = ok();
    await client.western.getKarmaDestiny(coupleData);
    expect((mock.mock.calls[0] as [string])[0]).toContain("karma_destiny_report/tropical");
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body).toHaveProperty("p_day", 10);
    expect(body).toHaveProperty("s_day", 15);
  });

  // ── Compatibility ─────────────────────────────────────────────────────────
  it("getZodiacCompatibility posts to zodiac_compatibility/:z1/:z2", async () => {
    const mock = ok();
    await client.western.getZodiacCompatibility("aries", "libra");
    expect((mock.mock.calls[0] as [string])[0]).toContain("zodiac_compatibility/aries/libra");
  });

  it("getSynastry flattens couple data with p_/s_ keys", async () => {
    const mock = ok();
    await client.western.getSynastry(coupleData);
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body).toHaveProperty("p_day", 10);
    expect(body).toHaveProperty("s_day", 15);
    expect(body).toHaveProperty("p_tzone", 5.5);
    expect(body).toHaveProperty("s_lat", 28.6139);
  });

  it("getSynastry posts to synastry_horoscope", async () => {
    const mock = ok();
    await client.western.getSynastry(coupleData);
    expect((mock.mock.calls[0] as [string])[0]).toContain("synastry_horoscope");
  });

  it("getComposite posts to composite_horoscope", async () => {
    const mock = ok();
    await client.western.getComposite(coupleData);
    expect((mock.mock.calls[0] as [string])[0]).toContain("composite_horoscope");
  });
});
