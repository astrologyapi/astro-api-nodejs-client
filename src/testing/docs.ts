import type { ExecutionResult, PostmanEndpointInventory, ResolvedAuthStyle, SDKMethodInventory } from "./models.js";
import { formatJsonBlock } from "./normalize.js";
import { postmanAuthSummary } from "./postman.js";

export function buildSdkModulesDocument(
  sdkEntries: SDKMethodInventory[],
  postmanEntries: PostmanEndpointInventory[],
  executionResults: ExecutionResult[],
  resolvedAuthStyle: ResolvedAuthStyle,
  generatedAt: string,
): string {
  const postmanMap = new Map(postmanEntries.map((entry) => [entry.normalizedEndpoint, entry]));
  const executionMap = new Map(executionResults.map((result) => [result.qualifiedName, result]));

  const groupedEntries = groupByModule(sdkEntries);
  const sections: string[] = [
    "# SDK Modules",
    "",
    `Generated at: ${generatedAt}`,
    `Resolved auth style used for the latest live SDK run: \`${resolvedAuthStyle}\``,
    "",
  ];

  for (const [moduleName, entries] of groupedEntries) {
    sections.push(`## ${moduleName}`);
    sections.push("");

    for (const entry of entries) {
      const postmanEntry = postmanMap.get(entry.normalizedEndpoint);
      const executionResult = executionMap.get(entry.qualifiedName);
      const responseShape = executionResult?.responseShape ?? "Not inferred in this run";

      sections.push(`### ${entry.method}`);
      sections.push(`- Qualified SDK call: \`client.${entry.qualifiedName}(...)\``);
      sections.push(`- Endpoint: \`${entry.normalizedEndpoint || entry.endpoint || "unresolved"}\``);
      sections.push(`- Domain: \`${entry.domain}\``);
      sections.push(`- Observed SDK auth style: \`${entry.resolvedAuthStyle}\``);
      sections.push(`- Postman coverage: ${postmanEntry ? "covered" : "missing from Postman collections"}`);
      sections.push(`- Postman auth expectation: ${postmanEntry ? postmanAuthSummary(postmanEntry.authStyles) : "not available"}`);
      sections.push(`- SDK parameter names: \`${entry.parameterNames.join("`, `") || "none"}\``);
      sections.push(`- SDK request encoding: \`${entry.requestEncoding}\``);
      sections.push(`- SDK request body keys: \`${entry.requestFields.join("`, `") || "none"}\``);
      sections.push(`- Postman request body keys: \`${postmanEntry?.bodyParameters.filter((parameter) => !parameter.disabled).map((parameter) => parameter.key).join("`, `") || "none"}\``);
      sections.push("");
      sections.push("#### Request Body");
      sections.push("");
      sections.push(formatJsonBlock(entry.requestBody));
      sections.push("");
      sections.push("#### Inferred Response Shape");
      sections.push("");
      sections.push(formatJsonBlock(responseShape));
      sections.push("");
    }
  }

  return sections.join("\n");
}

export function buildTestGuide(resolvedAuthStyle: ResolvedAuthStyle, generatedAt: string): string {
  return [
    "# Test SDK Guide",
    "",
    `Generated at: ${generatedAt}`,
    `Most recent documented resolved auth style: \`${resolvedAuthStyle}\``,
    "",
    "## Current Node.js Status",
    "",
    "- Deterministic live QA sweep is currently green: `144/144` SDK methods successful",
    "- Current unit-test baseline is `200` passing tests",
    "- `mock/results/failing-apis.md` is expected to be empty after the latest Node.js run",
    "",
    "## What This QA Layer Covers",
    "",
    "- Postman collection coverage against the Node.js SDK surface",
    "- Missing APIs and SDK-only APIs",
    "- Request parameter mismatches and body-shape mismatches",
    "- Full SDK execution checks for every mapped SDK method",
    "- Randomized SDK vs direct API comparisons",
    "- Single-endpoint debugging with editable SDK and Postman targets",
    "- Separate handling for plan-restricted endpoints (`402` / `403`)",
    "- PDF validation using either a non-empty binary PDF payload or a successful JSON response containing `pdf_url`",
    "",
    "## Authentication Resolution",
    "",
    "The SDK and QA runners infer authentication from the configured `ASTROLOGYAPI_API_KEY`:",
    "",
    "- if the API key contains `ak-`, requests use `x-astrologyapi-key`",
    "- otherwise requests use `Authorization: Basic base64(userId:apiKey)`",
    "- no separate auth flag is required",
    "",
    "The same inference rule is respected by:",
    "",
    "- the live SDK runner",
    "- the direct API comparison runner",
    "- the generated markdown result files",
    "",
    "## Output Files",
    "",
    "- `mock/catalog/sdk-modules.md` documents module functions, request bodies, and inferred response shapes",
    "- `mock/results/missing-apis.md` highlights collection/SDK coverage gaps",
    "- `mock/results/parameter-mismatches.md` highlights request-shape differences",
    "- `mock/results/failing-apis.md` captures failed SDK executions grouped by error signature",
    "- `mock/results/not-testable-with-current-plan.md` captures `402` / `403` cases separately",
    "- `mock/results/inconsistent-responses.md` captures randomized SDK vs direct API mismatches",
    "",
    "## Deterministic Runner",
    "",
    "The deterministic runner executes every SDK function that can be invoked from the discovered namespace surface using the reusable scenario files in `mock/test-data/`.",
    "",
    "Behavior:",
    "",
    "- JSON endpoints are treated as successful on `2xx` responses",
    "- PDF endpoints are treated as successful when they return either a valid non-empty PDF payload or a successful JSON report-generation response with `pdf_url`",
    "- `402` and `403` are reported as not testable rather than failures",
    "",
    "## Randomized Comparison Runner",
    "",
    "The comparison runner chooses a random subset of SDK methods, builds matching direct API requests from the Postman collections, and compares normalized results.",
    "",
    "Behavior:",
    "",
    "- JSON comparison uses normalized object-key ordering and detailed diff output",
    "- PDF comparison checks for either a valid binary PDF response or a successful JSON report-generation response with `pdf_url`, instead of byte-for-byte equality",
    "- endpoints that are plan-restricted for the current credentials are skipped and reported separately",
    "",
    "## Single Endpoint Debug Runner",
    "",
    "Use `src/testing/test-single-api.ts` when you want to debug just one SDK method and one Postman endpoint.",
    "",
    "Behavior:",
    "",
    "- edit `SDK_TARGET` to choose the SDK function you want to inspect",
    "- edit `DIRECT_TARGET_LOOKUP` to choose the matching Postman endpoint or item name",
    "- leave `DIRECT_TARGET_LOOKUP` empty to reuse the SDK normalized endpoint automatically",
    "- if no Postman match is found, the runner falls back to the SDK-resolved endpoint and request body for a direct live call",
    "- if a Postman match exists but its request body is stale or missing fields that the SDK request already has, the runner can retry with the SDK-resolved request body and will print the fallback reason",
    "- run `npm run qa:single` to print invocation args, SDK request/response, direct request/response, and comparison diff details",
    "",
    "## What To Port To Another SDK",
    "",
    "- reuse `mock/catalog/postman-endpoints.json` as the collection source of truth",
    "- reuse the full `mock/test-data/` folder as the canonical scenario set",
    "- recreate the same result files under `mock/results/`",
    "- recreate the same process docs under `mock/docs/`",
    "- implement the three runner modes: deterministic sweep, randomized compare, and single-endpoint debugging",
    "- keep auth inference, PDF validation, secret redaction, and stale-Postman fallback behavior aligned with this Node.js SDK",
    "",
    "## Reuse In Other SDKs",
    "",
    "The `mock/` folder is intentionally structured so the same catalog and scenario data can be reused or translated for Swift, Kotlin, Python, and other SDK QA implementations.",
    "",
  ].join("\n");
}

function groupByModule(entries: SDKMethodInventory[]): Array<[string, SDKMethodInventory[]]> {
  const groups = new Map<string, SDKMethodInventory[]>();

  for (const entry of entries) {
    const current = groups.get(entry.module) ?? [];
    current.push(entry);
    groups.set(entry.module, current);
  }

  return [...groups.entries()];
}
