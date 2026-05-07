// ─────────────────────────────────────────────────────────────────────────────
// AstrologyAPI error hierarchy
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Base error for all AstrologyAPI SDK errors.
 * Catch this to handle any SDK-level error in one place.
 */
export class AstrologyAPIError extends Error {
  /** HTTP status code returned by the API, if available. */
  readonly status?: number;
  /** Raw error body returned by the API, if available. */
  readonly body?: unknown;

  constructor(message: string, status?: number, body?: unknown) {
    super(message);
    this.name = "AstrologyAPIError";
    this.status = status;
    this.body = body;
    // Maintain proper prototype chain in transpiled JS
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the userId or apiKey is missing or invalid (HTTP 401 / 403).
 */
export class AuthenticationError extends AstrologyAPIError {
  constructor(message = "Invalid userId or apiKey.", status?: number, body?: unknown) {
    super(message, status, body);
    this.name = "AuthenticationError";
  }
}

/**
 * Thrown when the API rate limit is exceeded (HTTP 429).
 */
export class RateLimitError extends AstrologyAPIError {
  /** Seconds to wait before retrying, if the API provides this header. */
  readonly retryAfter?: number;

  constructor(message = "Rate limit exceeded. Please wait before retrying.", retryAfter?: number, body?: unknown) {
    super(message, 429, body);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

/**
 * Thrown when a request parameter is invalid (HTTP 400 / 422).
 */
export class ValidationError extends AstrologyAPIError {
  /** The field or parameter that caused the validation failure, if identifiable. */
  readonly field?: string;

  constructor(message: string, field?: string, body?: unknown) {
    super(message, 422, body);
    this.name = "ValidationError";
    this.field = field;
  }
}

/**
 * Thrown when the account quota or plan limit has been reached (HTTP 402 / 429).
 */
export class QuotaExceededError extends AstrologyAPIError {
  constructor(message = "API quota exceeded. Please upgrade your plan or wait for the quota to reset.", body?: unknown) {
    super(message, 402, body);
    this.name = "QuotaExceededError";
  }
}

/**
 * Thrown when an endpoint is not available on the current plan (HTTP 403).
 */
export class PlanRestrictedError extends AstrologyAPIError {
  constructor(message = "This endpoint is not available on your current plan. Please upgrade at astrologyapi.com.", body?: unknown) {
    super(message, 403, body);
    this.name = "PlanRestrictedError";
  }
}

/**
 * Thrown when the API returns a 5xx server error.
 */
export class ServerError extends AstrologyAPIError {
  constructor(message = "AstrologyAPI server error. Please try again later.", status?: number, body?: unknown) {
    super(message, status, body);
    this.name = "ServerError";
  }
}

/**
 * Thrown when the request could not reach the server (network error, timeout, etc.).
 */
export class NetworkError extends AstrologyAPIError {
  readonly cause?: unknown;

  constructor(message = "Unable to reach AstrologyAPI. Check your network connection.", cause?: unknown) {
    super(message);
    this.name = "NetworkError";
    this.cause = cause;
  }
}
