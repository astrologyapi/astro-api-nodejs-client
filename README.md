# AstrologyAPI Node.js / TypeScript SDK

Official Node.js and TypeScript SDK for [AstrologyAPI.com](https://astrologyapi.com).

## Contents

- [Installation](#installation)
- [Authentication](#authentication)
- [Quick Start](#quick-start)
- [Client Config](#client-config)
- [Shared Request Types](#shared-request-types)
- [Supported Values](#supported-values)
- [Namespaces](#namespaces)
- [API Reference](#api-reference)
  - [Vedic](#vedic)
  - [KP](#kp)
  - [Lal Kitab](#lal-kitab)
  - [Horoscopes](#horoscopes)
  - [Numerology](#numerology)
  - [Western](#western)
  - [Western Transit](#western-transit)
  - [Tarot](#tarot)
  - [Chinese](#chinese)
  - [PDF Reports](#pdf-reports)
  - [Location](#location)
  - [Custom Request](#custom-request)
- [Error Handling](#error-handling)
- [License](#license)

## Installation

```bash
npm install astrologyapi
```

## Authentication

This SDK uses token-based authentication with an access token.

```ts
import { AstrologyAPI } from "astrologyapi";

const client = new AstrologyAPI({
  access_token: "YOUR_ACCESS_TOKEN",
});
```

You can also use an environment variable:

```bash
ASTROLOGYAPI_ACCESS_TOKEN=your_access_token
```

## Quick Start

```ts
import { AstrologyAPI } from "astrologyapi";

const client = new AstrologyAPI({
  access_token: "YOUR_ACCESS_TOKEN",
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

const chart = await client.vedic.getChart("D1", birthData);
const planets = await client.western.getPlanets(birthData);
const daily = await client.horoscopes.getDaily("aries");
```

## Client Config

```ts
type AstrologyAPIConfig = {
  access_token: string;
  version?: string;
};
```

Rules:

- `access_token` is required for authentication
- `version` defaults to `v1`

## Shared Request Types

### BirthData

```ts
type BirthData = {
  day: number;
  month: number;
  year: number;
  hour: number;
  min: number;
  lat: number;
  lon: number;
  tzone: number;
};
```

### MatchBirthData

```ts
type MatchBirthData = {
  male: BirthData;
  female: BirthData;
};
```

### CoupleBirthData

```ts
type CoupleBirthData = {
  person1: BirthData;
  person2: BirthData;
};
```

### NumerologyData

```ts
type NumerologyData = {
  day: number;
  month: number;
  year: number;
  name: string;
};
```

### VarshaphalData

```ts
type VarshaphalData = BirthData & {
  varshaphal_year?: number;
  year_count?: number;
  ayanamsha?: string;
};
```

Notes:

- `varshaphal_year` is the preferred field
- `year_count` is still supported for backward compatibility
- `ayanamsha` defaults to `LAHIRI`

### PapasamyamData

```ts
type PapasamyamData = BirthData & {
  full_name?: string;
  name?: string;
  date?: number;
  ayanamsha?: string;
};
```

Notes:

- `full_name` is the preferred name field
- `name` is accepted as a compatibility alias
- `date` defaults to `day`
- `ayanamsha` defaults to `LAHIRI`

### PDFBranding

```ts
type PDFBranding = {
  logoUrl?: string;
  companyName?: string;
  companyInfo?: string;
  domainUrl?: string;
  companyEmail?: string;
  companyLandline?: string;
  companyMobile?: string;
  footerLink?: string;
  chartStyle?: "NORTH_INDIAN" | "SOUTH_INDIAN" | "EAST_INDIAN";
};
```

## Supported Values

### ChartId Values

`D1`, `D2`, `D3`, `D4`, `D5`, `D7`, `D9`, `D10`, `D12`, `D16`, `D20`, `D24`, `D27`, `D30`, `D40`, `D45`, `D60`

### ZodiacSign Values

`aries`, `taurus`, `gemini`, `cancer`, `leo`, `virgo`, `libra`, `scorpio`, `sagittarius`, `capricorn`, `aquarius`, `pisces`

### PlanetName Values

`sun`, `moon`, `mars`, `mercury`, `jupiter`, `venus`, `saturn`, `rahu`, `ketu`, `ascendant`

### DashaPlanet Values

`sun`, `moon`, `mars`, `rahu`, `jupiter`, `saturn`, `mercury`, `ketu`, `venus`

### Language Values

`en`, `hi`, `te`, `ta`, `ml`, `kn`, `mr`, `bn`, `gu`, `or`, `pa`

## Namespaces

- [`client.vedic`](#vedic)
- [`client.kp`](#kp)
- [`client.lalKitab`](#lal-kitab)
- [`client.horoscopes`](#horoscopes)
- [`client.numerology`](#numerology)
- [`client.western`](#western)
- [`client.westernTransit`](#western-transit)
- [`client.tarot`](#tarot)
- [`client.chinese`](#chinese)
- [`client.pdf.vedic`](#pdf-reports)
- [`client.pdf.western`](#pdf-reports)
- [`client.location`](#location)

## API Reference

## Vedic

Use `client.vedic`.

### Core Data and Charts

- `getBirthDetails(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getAstroDetails(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getAyanamsha(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getPlanets(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getExtendedPlanets(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getPlanetAshtak(planet: [PlanetName](#planetname-values), data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getSarvashtak(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getGhatChakra(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getChart(chartId: [ChartId](#chartid-values), data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getChartImage(chartId: [ChartId](#chartid-values), data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getExtendedChart(chartId: [ChartId](#chartid-values), data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getExtendedChart(data: [BirthData](#birthdata), language?: [Language](#language-values))`

### Dashas

- `getCurrentDasha(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getMajorDasha(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getSubDasha(mahaDasha: [DashaPlanet](#dashaplanet-values), data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getSubSubDasha(mahaDasha: [DashaPlanet](#dashaplanet-values), antarDasha: [DashaPlanet](#dashaplanet-values), data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getSubSubSubDasha(mahaDasha: [DashaPlanet](#dashaplanet-values), antarDasha: [DashaPlanet](#dashaplanet-values), pratyantarDasha: [DashaPlanet](#dashaplanet-values), data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getSubSubSubSubDasha(mahaDasha: [DashaPlanet](#dashaplanet-values), antarDasha: [DashaPlanet](#dashaplanet-values), pratyantarDasha: [DashaPlanet](#dashaplanet-values), sookshmaDasha: [DashaPlanet](#dashaplanet-values), data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getCurrentCharDasha(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getMajorCharDasha(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getSubCharDasha(mahaDasha: string, data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getCurrentYoginiDasha(data: [BirthData](#birthdata), language?: [Language](#language-values))`

### Doshas, Remedies, Panchang, and Reports

- `getKalsarpaDosha(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getManglik(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getSadhesatiStatus(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getSadhesatiLifeDetails(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getPitraDosha(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getGemSuggestion(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getPujaSuggestion(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getRudrakshaSuggestion(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getSadhesatiRemedies(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getBasicPanchang(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getAdvancedPanchang(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getPlanetPanchang(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getTamilPanchang(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getFestival(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getHoraMuhurta(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getChaughadiyaMuhurta(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getAscendantReport(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getNakshatraReport(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getHouseReport(planet: [PlanetName](#planetname-values), data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getRashiReport(planet: [PlanetName](#planetname-values), data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getBiorhythm(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getMoonBiorhythm(data: [BirthData](#birthdata), language?: [Language](#language-values))`

### Match Making

- `getMatchBirthDetails(data: [MatchBirthData](#matchbirthdata), language?: [Language](#language-values))`
- `getMatchObstructions(data: [MatchBirthData](#matchbirthdata), language?: [Language](#language-values))`
- `getMatchAstroDetails(data: [MatchBirthData](#matchbirthdata), language?: [Language](#language-values))`
- `getMatchPlanetDetails(data: [MatchBirthData](#matchbirthdata), language?: [Language](#language-values))`
- `getMatchManglikReport(data: [MatchBirthData](#matchbirthdata), language?: [Language](#language-values))`
- `getAshtakootPoints(data: [MatchBirthData](#matchbirthdata), language?: [Language](#language-values))`
- `getDashakootPoints(data: [MatchBirthData](#matchbirthdata), language?: [Language](#language-values))`
- `getMatchPercentage(data: [MatchBirthData](#matchbirthdata), language?: [Language](#language-values))`
- `getMatchReport(data: [MatchBirthData](#matchbirthdata), language?: [Language](#language-values))`
- `getDetailedMatchReport(data: [MatchBirthData](#matchbirthdata), language?: [Language](#language-values))`
- `getSimpleMatchReport(data: [MatchBirthData](#matchbirthdata), language?: [Language](#language-values))`
- `getPapasamyam(data: [PapasamyamData](#papasamyamdata), language?: [Language](#language-values))`

### Varshaphal

- `getVarshaphalDetails(data: [VarshaphalData](#varshaphaldata), language?: [Language](#language-values))`
- `getVarshaphalYearChart(data: [VarshaphalData](#varshaphaldata), language?: [Language](#language-values))`
- `getVarshaphalMonthChart(data: [VarshaphalData](#varshaphaldata), language?: [Language](#language-values))`
- `getVarshaphalPlanets(data: [VarshaphalData](#varshaphaldata), language?: [Language](#language-values))`
- `getVarshaphalMuntha(data: [VarshaphalData](#varshaphaldata), language?: [Language](#language-values))`
- `getVarshaphalMuddaDasha(data: [VarshaphalData](#varshaphaldata), language?: [Language](#language-values))`
- `getVarshaphalPanchavargeeya(data: [VarshaphalData](#varshaphaldata), language?: [Language](#language-values))`
- `getVarshaphalHarshaBala(data: [VarshaphalData](#varshaphaldata), language?: [Language](#language-values))`
- `getVarshaphalYoga(data: [VarshaphalData](#varshaphaldata), language?: [Language](#language-values))`
- `getVarshaphalSahamPoints(data: [VarshaphalData](#varshaphaldata), language?: [Language](#language-values))`

## KP

Use `client.kp`.

- `getPlanets(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getHouseCusps(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getBirthChart(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getHouseSignificator(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getPlanetSignificator(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getHoroscope(data: [BirthData](#birthdata), language?: [Language](#language-values))`

## Lal Kitab

Use `client.lalKitab`.

- `getHoroscope(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getDebts(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getRemedies(planet: [PlanetName](#planetname-values), data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getHouses(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getPlanets(data: [BirthData](#birthdata), language?: [Language](#language-values))`

## Horoscopes

Use `client.horoscopes`.

- `getDaily(zodiac: [ZodiacSign](#zodiacsign-values), language?: [Language](#language-values))`
- `getNext(zodiac: [ZodiacSign](#zodiacsign-values), timezoneOrLanguage?: number | [Language](#language-values), language?: [Language](#language-values))`
- `getPrevious(zodiac: [ZodiacSign](#zodiacsign-values), timezoneOrLanguage?: number | [Language](#language-values), language?: [Language](#language-values))`
- `getDailyConsolidated(zodiac: [ZodiacSign](#zodiacsign-values), timezoneOrLanguage?: number | [Language](#language-values), language?: [Language](#language-values))`
- `getMonthly(zodiac: [ZodiacSign](#zodiacsign-values), timezoneOrLanguage?: number | [Language](#language-values), language?: [Language](#language-values))`
- `getDailyNakshatra(data: [BirthData](#birthdata), language?: [Language](#language-values))`

## Numerology

Use `client.numerology`.

- `getTable(data: [NumerologyData](#numerologydata), language?: [Language](#language-values))`
- `getReport(data: [NumerologyData](#numerologydata), language?: [Language](#language-values))`
- `getFavTime(data: [NumerologyData](#numerologydata), language?: [Language](#language-values))`
- `getPlaceVastu(data: [NumerologyData](#numerologydata), language?: [Language](#language-values))`
- `getFastsReport(data: [NumerologyData](#numerologydata), language?: [Language](#language-values))`
- `getFavLord(data: [NumerologyData](#numerologydata), language?: [Language](#language-values))`
- `getFavMantra(data: [NumerologyData](#numerologydata), language?: [Language](#language-values))`
- `getDailyPrediction(data: [NumerologyData](#numerologydata), language?: [Language](#language-values))`
- `getNumerologicalNumbers(data: [NumerologyData](#numerologydata), language?: [Language](#language-values))`
- `getLifepathNumber(data: [NumerologyData](#numerologydata), language?: [Language](#language-values))`
- `getPersonalityNumber(data: [NumerologyData](#numerologydata), language?: [Language](#language-values))`
- `getExpressionNumber(data: [NumerologyData](#numerologydata), language?: [Language](#language-values))`
- `getSoulUrgeNumber(data: [NumerologyData](#numerologydata), language?: [Language](#language-values))`
- `getChallengeNumbers(data: [NumerologyData](#numerologydata), language?: [Language](#language-values))`
- `getPersonalDay(data: [NumerologyData](#numerologydata), language?: [Language](#language-values))`
- `getPersonalMonth(data: [NumerologyData](#numerologydata), language?: [Language](#language-values))`
- `getPersonalYear(data: [NumerologyData](#numerologydata), language?: [Language](#language-values))`

## Western

Use `client.western`.

- `getPlanets(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getHouseCusps(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getHoroscope(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getNatalWheelChart(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getNatalInterpretation(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getHouseCuspsReport(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getNatalHouseCuspReport(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getAscendantReport(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getSignReport(planet: [PlanetName](#planetname-values), data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getHouseReport(planet: [PlanetName](#planetname-values), data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getMoonPhase(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getLunarMetrics(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getSolarReturnDetails(data: [BirthData](#birthdata) & { year?: number }, language?: [Language](#language-values))`
- `getSolarReturnPlanets(data: [BirthData](#birthdata) & { year?: number }, language?: [Language](#language-values))`
- `getSolarReturnHouseCusps(data: [BirthData](#birthdata) & { year?: number }, language?: [Language](#language-values))`
- `getSolarReturnPlanetReport(data: [BirthData](#birthdata) & { year?: number }, language?: [Language](#language-values))`
- `getSolarReturnPlanetAspects(data: [BirthData](#birthdata) & { year?: number }, language?: [Language](#language-values))`
- `getSolarReturnAspectsReport(data: [BirthData](#birthdata) & { year?: number }, language?: [Language](#language-values))`
- `getPersonality(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getRomanticPersonality(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getFriendship(data: [CoupleBirthData](#couplebirthdata), language?: [Language](#language-values))`
- `getRomanticForecast(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getKarmaDestiny(data: [CoupleBirthData](#couplebirthdata), language?: [Language](#language-values))`
- `getZodiacCompatibility(zodiac: [ZodiacSign](#zodiacsign-values), partnerZodiac: [ZodiacSign](#zodiacsign-values), language?: [Language](#language-values))`
- `getSynastry(data: [CoupleBirthData](#couplebirthdata), language?: [Language](#language-values))`
- `getComposite(data: [CoupleBirthData](#couplebirthdata), language?: [Language](#language-values))`

## Western Transit

Use `client.westernTransit`.

- `getDaily(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getWeekly(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getMonthly(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getNatalDaily(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getNatalWeekly(data: [BirthData](#birthdata), language?: [Language](#language-values))`

## Tarot

Use `client.tarot`.

- `getPredictions(language?: [Language](#language-values))`
- `getYesNo(language?: [Language](#language-values))`

## Chinese

Use `client.chinese`.

- `getZodiac(data: [BirthData](#birthdata), language?: [Language](#language-values))`
- `getYearForecast(data: [BirthData](#birthdata), language?: [Language](#language-values))`

## PDF Reports

Use `client.pdf.vedic` and `client.pdf.western`.

All PDF requests are sent as form data and accept optional [`PDFBranding`](#pdfbranding).

### Vedic PDF Input

```ts
type VedicPDFData = BirthData & {
  gender?: string;
  name?: string;
  place?: string;
};
```

```ts
type VedicMatchMakingPDFData = MatchBirthData & {
  name?: string;
  partner_name?: string;
  place?: string;
  m_first_name?: string;
  m_last_name?: string;
  m_place?: string;
  f_first_name?: string;
  f_last_name?: string;
  f_place?: string;
  ashtakoot?: boolean;
  dashakoot?: boolean;
  papasyam?: boolean;
};
```

- `getMiniKundli(data: VedicPDFData, branding?: [PDFBranding](#pdfbranding), language?: [Language](#language-values))`
- `getBasicHoroscope(data: VedicPDFData, branding?: [PDFBranding](#pdfbranding), language?: [Language](#language-values))`
- `getProfessionalHoroscope(data: VedicPDFData, branding?: [PDFBranding](#pdfbranding), language?: [Language](#language-values))`
- `getMatchMaking(data: VedicMatchMakingPDFData, branding?: [PDFBranding](#pdfbranding), language?: [Language](#language-values))`

### Western PDF Input

```ts
type WesternPDFData = BirthData & {
  name?: string;
  place?: string;
  solar_year?: number;
};
```

```ts
type WesternSynastryPDFData = CoupleBirthData & {
  name?: string;
  partner_name?: string;
  place?: string;
  p_first_name?: string;
  p_last_name?: string;
  p_place?: string;
  s_first_name?: string;
  s_last_name?: string;
  s_place?: string;
};
```

- `getNatalChart(data: WesternPDFData, branding?: [PDFBranding](#pdfbranding), language?: [Language](#language-values))`
- `getLifeForecast(data: WesternPDFData, branding?: [PDFBranding](#pdfbranding), language?: [Language](#language-values))`
- `getSolarReturn(data: WesternPDFData, branding?: [PDFBranding](#pdfbranding), language?: [Language](#language-values))`
- `getSynastry(data: WesternSynastryPDFData, branding?: [PDFBranding](#pdfbranding), language?: [Language](#language-values))`

## Location

Use `client.location`.

- `getGeoDetails(place: string, maxRows?: number, language?: [Language](#language-values))`
- `getTimezone(data: { day: number; month: number; year: number; hour: number; min: number; lat: number; lon: number }, language?: [Language](#language-values))`

## Custom Request

Use this when you need to call an endpoint that is not yet wrapped by a namespace method.

```ts
const result = await client.customRequest({
  endpoint: "some_endpoint",
  body: {
    day: 10,
    month: 5,
    year: 1990,
    hour: 19,
    min: 55,
    lat: 19.2,
    lon: 72.83,
    tzone: 5.5,
  },
});
```

```ts
client.customRequest<T>({
  endpoint: string;
  body?: Record<string, unknown>;
  domain?: "json" | "pdf";
  language?: Language;
});
```

## Error Handling

The SDK throws typed errors:

- `AstrologyAPIError`
- `AuthenticationError`
- `ValidationError`
- `RateLimitError`
- `QuotaExceededError`
- `PlanRestrictedError`
- `ServerError`
- `NetworkError`

Example:

```ts
import { AstrologyAPI, ValidationError, AstrologyAPIError } from "astrologyapi";

try {
  const client = new AstrologyAPI({
    access_token: "YOUR_ACCESS_TOKEN",
  });

  const result = await client.vedic.getPlanets({
    day: 10,
    month: 5,
    year: 1990,
    hour: 19,
    min: 55,
    lat: 19.2,
    lon: 72.83,
    tzone: 5.5,
  });

  console.log(result);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(error.message, error.body);
  } else if (error instanceof AstrologyAPIError) {
    console.error(error.status, error.message);
  } else {
    console.error(error);
  }
}
```

## License

MIT
