import { describe, it, expect } from "vitest";
import {
  AstrologyAPIError,
  AuthenticationError,
  NetworkError,
  PlanRestrictedError,
  QuotaExceededError,
  RateLimitError,
  ServerError,
  ValidationError,
} from "../src/errors.js";

describe("Error hierarchy", () => {
  // ── instanceof chain ─────────────────────────────────────────────────────

  it("all errors are instances of AstrologyAPIError", () => {
    expect(new AuthenticationError()).toBeInstanceOf(AstrologyAPIError);
    expect(new RateLimitError()).toBeInstanceOf(AstrologyAPIError);
    expect(new ValidationError("bad")).toBeInstanceOf(AstrologyAPIError);
    expect(new QuotaExceededError()).toBeInstanceOf(AstrologyAPIError);
    expect(new PlanRestrictedError()).toBeInstanceOf(AstrologyAPIError);
    expect(new ServerError()).toBeInstanceOf(AstrologyAPIError);
    expect(new NetworkError()).toBeInstanceOf(AstrologyAPIError);
  });

  it("all errors are instances of Error", () => {
    expect(new AstrologyAPIError("x")).toBeInstanceOf(Error);
    expect(new AuthenticationError()).toBeInstanceOf(Error);
  });

  // ── name property ────────────────────────────────────────────────────────

  it("sets correct .name for each subclass", () => {
    expect(new AstrologyAPIError("x").name).toBe("AstrologyAPIError");
    expect(new AuthenticationError().name).toBe("AuthenticationError");
    expect(new RateLimitError().name).toBe("RateLimitError");
    expect(new ValidationError("x").name).toBe("ValidationError");
    expect(new QuotaExceededError().name).toBe("QuotaExceededError");
    expect(new PlanRestrictedError().name).toBe("PlanRestrictedError");
    expect(new ServerError().name).toBe("ServerError");
    expect(new NetworkError().name).toBe("NetworkError");
  });

  // ── status codes ─────────────────────────────────────────────────────────

  it("AuthenticationError stores status 401", () => {
    expect(new AuthenticationError("bad key", 401).status).toBe(401);
  });

  it("RateLimitError stores status 429", () => {
    expect(new RateLimitError().status).toBe(429);
  });

  it("ValidationError stores status 422", () => {
    expect(new ValidationError("invalid").status).toBe(422);
  });

  it("QuotaExceededError stores status 402", () => {
    expect(new QuotaExceededError().status).toBe(402);
  });

  it("PlanRestrictedError stores status 403", () => {
    expect(new PlanRestrictedError().status).toBe(403);
  });

  it("ServerError stores custom status", () => {
    expect(new ServerError("err", 503).status).toBe(503);
  });

  it("NetworkError has no status", () => {
    expect(new NetworkError().status).toBeUndefined();
  });

  // ── extra properties ─────────────────────────────────────────────────────

  it("RateLimitError exposes retryAfter", () => {
    const err = new RateLimitError("slow down", 30, {});
    expect(err.retryAfter).toBe(30);
  });

  it("RateLimitError retryAfter is undefined when not provided", () => {
    expect(new RateLimitError().retryAfter).toBeUndefined();
  });

  it("ValidationError exposes field", () => {
    const err = new ValidationError("bad lat", "lat");
    expect(err.field).toBe("lat");
  });

  it("ValidationError field is undefined when not provided", () => {
    expect(new ValidationError("bad").field).toBeUndefined();
  });

  it("NetworkError exposes cause", () => {
    const cause = new TypeError("failed");
    const err = new NetworkError("Network error", cause);
    expect(err.cause).toBe(cause);
  });

  it("AstrologyAPIError exposes body", () => {
    const body = { message: "error" };
    const err = new AstrologyAPIError("msg", 400, body);
    expect(err.body).toEqual(body);
  });

  // ── default messages ─────────────────────────────────────────────────────

  it("each error has a non-empty default message", () => {
    const errors = [
      new AuthenticationError(),
      new RateLimitError(),
      new ValidationError("x"),
      new QuotaExceededError(),
      new PlanRestrictedError(),
      new ServerError(),
      new NetworkError(),
    ];
    for (const err of errors) {
      expect(err.message.length).toBeGreaterThan(0);
    }
  });

  // ── prototype chain (transpiled JS safety) ───────────────────────────────

  it("instanceof works correctly after Object.setPrototypeOf fix", () => {
    const err = new RateLimitError();
    expect(err instanceof RateLimitError).toBe(true);
    expect(err instanceof AstrologyAPIError).toBe(true);
    expect(err instanceof Error).toBe(true);
  });
});
