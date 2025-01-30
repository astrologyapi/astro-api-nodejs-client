// src/client.js
const axios = require("axios");
const { BASE_JSON_API_URL, BASE_PDF_API_URL } = require("./utils/constants");
const { API_TYPES } = require("./utils/planEnums");

class AstrologyApiClient {
  /**
   * @param {Object} config
   * @param {string} config.userId - The user_id for authentication
   * @param {string} config.apiKey - The api_key for authentication
   * @param {string} [config.version] - API version, defaults to "v1"
   */
  constructor({ userId, apiKey, apiType, version = "v1" }) {
    if (!userId || !apiKey) {
      throw new Error(
        "Both userId and apiKey are required to initialize AstrologyApiClient."
      );
    }

    this.userId = userId;
    this.apiKey = apiKey;
    this.version = version;
    this.apiType = apiType;
    this.baseUrl =
      apiType && apiType.toLowerCase() === API_TYPES.PDF.toLowerCase()
        ? `${BASE_PDF_API_URL}/${version}`
        : `${BASE_JSON_API_URL}/${version}`;
  }

  /**
   * Make an API request
   * @param {Object} options
   * @param {string} options.method - HTTP method ("GET", "POST", etc.)
   * @param {string} options.endpoint - API endpoint (e.g., "birth_details")
   * @param {Object} [options.params={}] - Query params for GET or body for POST
   * @param {Object} [options.additionalHeaders={}] - Additional headers like "language"
   */
  async request({
    method = "POST",
    endpoint,
    params = {},
    additionalHeaders = {},
  }) {
    const url = `${this.baseUrl}/${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(
        +this.userId + ":" + this.apiKey
      ).toString("base64")}`,
      ...additionalHeaders,
    };

    const config = {
      method,
      url,
      headers,
    };

    if (["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
      config.data =
        this.apiType &&
        this.apiType.toLowerCase() === API_TYPES.PDF.toLowerCase()
          ? { ...params, language: additionalHeaders["Accept-Language"] }
          : params;
    }

    try {
      const response = await axios(config);
      return response.data; // Parse JSON response
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 2xx
        throw new Error(`${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // No response received
        throw new Error("No response received from the server.");
      } else {
        // Something else happened
        throw new Error(`Error in request setup: ${error.message}`);
      }
    }
  }
}

module.exports = AstrologyApiClient;
