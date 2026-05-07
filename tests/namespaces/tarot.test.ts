import { afterEach, describe, expect, it, vi } from "vitest";
import { AstrologyAPI } from "../../src/index.js";
import { stubFetch } from "../fixtures.js";

const client = new AstrologyAPI({ userId: "u", apiKey: "k" });
const ok = () => stubFetch({ body: { ok: true } });

afterEach(() => vi.unstubAllGlobals());

describe("tarot namespace", () => {
  it("getPredictions posts to tarot_predictions", async () => {
    const mock = ok();
    await client.tarot.getPredictions();
    expect((mock.mock.calls[0] as [string])[0]).toContain("tarot_predictions");
  });

  it("getYesNo posts to yes_no_tarot", async () => {
    const mock = ok();
    await client.tarot.getYesNo();
    expect((mock.mock.calls[0] as [string])[0]).toContain("yes_no_tarot");
  });

  // ── No-arg endpoints send empty body ──────────────────────────────────────
  it("getPredictions sends an empty body", async () => {
    const mock = ok();
    await client.tarot.getPredictions();
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body).toEqual({});
  });

  it("getYesNo sends an empty body", async () => {
    const mock = ok();
    await client.tarot.getYesNo();
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body).toEqual({});
  });

  // ── Language passthrough ──────────────────────────────────────────────────
  it("passes language as Accept-Language header", async () => {
    const mock = ok();
    await client.tarot.getPredictions("hi");
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["Accept-Language"]).toBe("hi");
  });
});
