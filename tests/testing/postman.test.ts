import {describe, expect, it} from "vitest";
import {buildDirectRequestBody} from "../../src/testing/postman.js";
import type {InvocationContext, PostmanEndpointInventory} from "../../src/testing/models.js";

const context: InvocationContext = {
  birth: {
    day: 10,
    month: 5,
    year: 1990,
    hour: 19,
    min: 55,
    lat: 19.2,
    lon: 72.83,
    tzone: 5.5,
    name: "Aarav Mehta",
    place: "Mumbai, Maharashtra, India",
    gender: "male",
  },
  match: {
    male: {
      day: 10,
      month: 5,
      year: 1990,
      hour: 19,
      min: 55,
      lat: 19.2,
      lon: 72.83,
      tzone: 5.5,
      name: "Aarav Mehta",
      place: "Mumbai, Maharashtra, India",
      gender: "male",
    },
    female: {
      day: 15,
      month: 8,
      year: 1992,
      hour: 14,
      min: 30,
      lat: 28.6139,
      lon: 77.209,
      tzone: 5.5,
      name: "Kavya Sharma",
      place: "Delhi, India",
      gender: "female",
    },
    name: "Aarav Mehta",
    partner_name: "Kavya Sharma",
    place: "Mumbai, Maharashtra, India",
  },
  couple: {
    person1: {
      day: 10,
      month: 5,
      year: 1990,
      hour: 19,
      min: 55,
      lat: 19.2,
      lon: 72.83,
      tzone: 5.5,
      name: "Aarav Mehta",
      place: "Mumbai, Maharashtra, India",
      gender: "male",
    },
    person2: {
      day: 4,
      month: 11,
      year: 1988,
      hour: 6,
      min: 20,
      lat: 40.7128,
      lon: -74.006,
      tzone: -5,
      name: "Olivia Carter",
      place: "New York, New York, USA",
      gender: "female",
    },
    name: "Aarav Mehta",
    partner_name: "Olivia Carter",
    place: "Mumbai, Maharashtra, India",
  },
  numerology: {
    day: 10,
    month: 5,
    year: 1990,
    name: "Aarav Mehta",
  },
  branding: {
    logo_url: "https://example.com/logo.png",
    company_name: "AstrologyAPI QA",
    company_info: "Reusable QA validation profile for SDK testing.",
    domain_url: "https://example.com",
    company_email: "qa@example.com",
    company_landline: "02240000000",
    company_mobile: "919999999999",
    footer_link: "https://example.com/reports",
    chart_style: "NORTH_INDIAN",
  },
  zodiacPair: {
    zodiac: "aries",
    partnerZodiac: "leo",
  },
  planet: "sun",
  chartId: "D1",
  mahaDasha: "aries",
  placeQuery: "Mumbai, Maharashtra, India",
  maxRows: 6,
  subjectName: "Aarav Mehta",
  partnerName: "Olivia Carter",
  subjectPlace: "Mumbai, Maharashtra, India",
};

describe("testing postman body builder", () => {
  it("fills varshaphal_year for Postman direct requests", () => {
    const entry: PostmanEndpointInventory = {
      normalizedEndpoint: "varshaphal_muntha",
      endpoint: "varshaphal_muntha",
      domain: "json",
      method: "POST",
      displayNames: ["varshaphal_muntha"],
      sourceFiles: ["mock"],
      bodyMode: "urlencoded",
      bodyParameters: [
        {key: "day", disabled: false},
        {key: "month", disabled: false},
        {key: "year", disabled: false},
        {key: "hour", disabled: false},
        {key: "min", disabled: false},
        {key: "lat", disabled: false},
        {key: "lon", disabled: false},
        {key: "tzone", disabled: false},
        {key: "ayanamsha", disabled: false},
        {key: "varshaphal_year", disabled: false},
      ],
      pathParameters: [],
      authStyles: ["header"],
      headerKeys: ["x-astrologyapi-key"],
    };

    const body = buildDirectRequestBody(entry, context);

    expect(body.varshaphal_year).toBe("2026");
    expect(body.ayanamsha).toBe("LAHIRI");
  });
});
