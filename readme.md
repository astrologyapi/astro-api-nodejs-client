# astrologyapi

A **Node.js SDK** for accessing the [astrologyapi.com](https://astrologyapi.com) endpoints, supporting both JSON-based and PDF-based methods.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [1. Initializing the SDK](#1-initializing-the-sdk)
  - [2. Vedic Methods](#2-vedic-methods)
  - [3. Western Methods](#3-western-methods)
  - [4. Custom Requests](#4-custom-requests)
- [API Types: JSON vs. PDF](#api-types-json-vs-pdf)
- [Error Handling](#error-handling)

---

## Features

- **Vedic Astrology** methods (e.g., birth details, astro details, horoscope PDFs, etc.)
- **Western Astrology** methods (e.g., tropical planets, sun sign predictions, natal wheel charts, etc.)
- **PDF Support**: Generate PDF reports (if your subscription/plan supports it)
- **Custom Requests**: Call endpoints not explicitly defined in the SDK
- **Optional Language Parameter** for localized results (if supported by your plan)

---

## Installation

```shell
npm install astrologyapi
```

(Requires Node.js 12+)

Usage

1. Initializing the SDK

```shell
// Import the SDK
const AstrologyAPI = require("astrologyapi");

// Create an instance with your credentials
const astrology = new AstrologyAPI({
  userId: "YOUR_USER_ID",    // numeric user ID
  apiKey: "YOUR_API_KEY",    // your API key
  apiType: "JSON",            // optional: "PDF" or "JSON" (defaults to "JSON")
  version: "v1"              // optional, defaults to "v1"
});
```

Key Parameters:

```shell
userId: Numeric user ID from your astrologyapi.com account.
apiKey: Your unique API key for authentication.
apiType (optional): "PDF" or "JSON". Defaults to "JSON".
version (optional): API version to use, defaults to "v1".

```

### 2. Vedic Methods

Each method returns a promise. Below are examples for commonly used endpoints. All methods accept an optional language parameter.

Birth Details

```shell
const params = {
  day: 1,
  month: 1,
  year: 2023,
  hour: 12,
  min: 24,
  lat: 19.07,
  lon: 72.87,
  tzone: 5.5
};

try {
  const birthDetails = await astrology.vedic.getBirthDetails(params, "en");
  console.log("Birth Details =>", birthDetails);
} catch (error) {
  console.error("Error fetching birth details:", error.message);
}

```

Astro Details

```bash
try {
  const astroDetails = await astrology.vedic.getAstroDetails(params, "en");
  console.log("Astro Details =>", astroDetails);
} catch (error) {
  console.error("Error fetching astro details:", error.message);
}

```

Planets

```bash
try {
  const planets = await astrology.vedic.getPlanets(params, "en");
  console.log("Planets =>", planets);
} catch (error) {
  console.error("Error fetching planets:", error.message);
}

```

Basic Horoscope PDF

If apiType is "PDF", you can generate PDF reports:

```bash
try {
  const pdfResponse = await astrology.vedic.getBasicHoroscopePDF({
    name: "Suraj Yadav",
    day: 1,
    month: 1,
    year: 2023,
    hour: 12,
    min: 24,
    lat: 19.07,
    lon: 72.87,
    tzone: 5.5,
    language:"en" // to know more about language options visit https://astrologyapi.com/docs/pdf-docs
  });
  console.log("Basic Horoscope PDF =>", pdfResponse);
} catch (error) {
  console.error("Error generating horoscope PDF:", error.message);
}
```

### 3. Western Methods

Similarly, for Western astrology endpoints:

Get Tropical Planets

```bash
try {
  const tropicalPlanets = await astrology.western.getTropicalPlanets(params, "en");
  console.log("Tropical Planets =>", tropicalPlanets);
} catch (error) {
  console.error("Error fetching tropical planets:", error.message);
}

```

Get Sun Sign Prediction (Daily)

```bash
try {
  // "aries" is an example zodiac name
  const dailyPrediction = await astrology.western.getSunSignPredictionDaily(
    {},       // your query parameters if any
    "en",     // language
    "aries"   // zodiacName
  );
  console.log("Daily Sun Sign Prediction =>", dailyPrediction);
} catch (error) {
  console.error("Error fetching sun sign prediction:", error.message);
}
```

Natal Wheel Chart

```bash
try {
  const natalWheel = await astrology.western.getNatalWheelChart(params);
  console.log("Natal Wheel Chart =>", natalWheel);
} catch (error) {
  console.error("Error fetching natal wheel chart:", error.message);
}

```

### 4. Custom Requests

If you need to call endpoints not yet provided as built-in methods, use the customRequest method:

```bash
try {
  const customEndpointResponse = await astrology.customRequest({
    method: "POST",
    endpoint: `sun_sign_prediction/daily/aries`,
    params: {
      // your request body or query params
         timezone:5.5,
    },
    language: "en"           // optional "Accept-Language" header
  });
  console.log("Custom Endpoint =>", customEndpointResponse);
} catch (error) {
  console.error("Error in custom request:", error.message);
}
```

Parameters:

```shell
method: Defaults to "POST".
endpoint: The API endpoint string (e.g., "some_new_endpoint").
params: Data for the request body (for POST) or query params (if using GET).
language: Optional, sets the "Accept-Language" header.
API Types: JSON vs. PDF
The SDK uses different base URLs for JSON and PDF:

```

If apiType is "JSON" (default), requests are routed to the JSON API.
If apiType is "PDF", requests are routed to the PDF API, and certain parameters (like language) may be appended in the request body automatically.

```shell
const astrologyPDF = new AstrologyAPI({
  userId: "YOUR_USER_ID",
  apiKey: "YOUR_API_KEY",
  apiType: "PDF",   // or "JSON"
  version: "v1"
});
```

Error Handling

4xx/5xx Errors: The SDK will throw an error with the response body (if available).

No Response: Throws "No response received from the server.".
Request Setup Error: Throws "Error in request setup: ...".
Catch These Errors with try/catch to handle them in your application.

Example:

```bash
try {
  const result = await astrology.vedic.getBirthDetails(params, "en");
} catch (error) {
  console.error("API Call Error:", error.message);
}
```
