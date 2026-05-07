import type {
  ComparisonResult,
  ExecutionResult,
  PostmanEndpointInventory,
  ResolvedAuthStyle,
  SDKMethodInventory,
} from "./models.js";
import {
  formatJsonBlock,
  staticEndpointBase,
} from "./normalize.js";
import { postmanAuthSummary } from "./postman.js";

export function buildMissingApisReport(
  postmanEntries: PostmanEndpointInventory[],
  sdkEntries: SDKMethodInventory[],
  resolvedAuthStyle: ResolvedAuthStyle,
  generatedAt: string,
): string {
  const postmanSet = new Set(postmanEntries.map((entry) => entry.normalizedEndpoint));
  const sdkSet = new Set(sdkEntries.map((entry) => entry.normalizedEndpoint).filter(Boolean));

  const missingFromSdk = [...postmanSet].filter((endpoint) => !sdkSet.has(endpoint)).sort();
  const extraInSdk = [...sdkSet].filter((endpoint) => !postmanSet.has(endpoint)).sort();

  return [
    "# Missing APIs",
    "",
    `Generated at: ${generatedAt}`,
    `Resolved auth style for the current QA run: \`${resolvedAuthStyle}\``,
    "",
    "## Postman APIs Missing From SDK",
    "",
    ...renderEndpointList(missingFromSdk, "Every Postman endpoint is currently represented in the SDK inventory."),
    "",
    "## SDK APIs Absent From Postman Collections",
    "",
    ...renderEndpointList(extraInSdk, "No extra SDK-only endpoints were found."),
    "",
  ].join("\n");
}

export function buildParameterMismatchReport(
  postmanEntries: PostmanEndpointInventory[],
  sdkEntries: SDKMethodInventory[],
  resolvedAuthStyle: ResolvedAuthStyle,
  generatedAt: string,
): string {
  const postmanMap = new Map(postmanEntries.map((entry) => [entry.normalizedEndpoint, entry]));
  const exactMismatches: string[] = [];
  const pathMismatches: string[] = [];

  for (const sdkEntry of sdkEntries) {
    if (!sdkEntry.normalizedEndpoint) {
      continue;
    }

    const postmanEntry = postmanMap.get(sdkEntry.normalizedEndpoint);
    if (postmanEntry) {
      const postmanFields = new Set(
        postmanEntry.bodyParameters
          .filter((parameter) => !parameter.disabled)
          .map((parameter) => parameter.key),
      );
      const sdkFields = new Set(sdkEntry.requestFields);

      const missingInSdk = [...postmanFields].filter((field) => !sdkFields.has(field)).sort();
      const extraInSdk = [...sdkFields].filter((field) => !postmanFields.has(field)).sort();
      const encodingMismatch = postmanEntry.bodyMode === "urlencoded" && sdkEntry.requestEncoding !== "form-urlencoded";
      const authMismatch = postmanEntry.authStyles.length > 0 && !postmanEntry.authStyles.includes(resolvedAuthStyle);

      if (missingInSdk.length === 0 && extraInSdk.length === 0 && !encodingMismatch && !authMismatch) {
        continue;
      }

      exactMismatches.push([
        `### ${sdkEntry.qualifiedName}`,
        `- Endpoint: \`${sdkEntry.normalizedEndpoint}\``,
        `- Postman auth expectation: ${postmanAuthSummary(postmanEntry.authStyles)}`,
        `- SDK request encoding: \`${sdkEntry.requestEncoding}\``,
        `- Postman body mode: \`${postmanEntry.bodyMode}\``,
        missingInSdk.length > 0 ? `- Missing in SDK request: \`${missingInSdk.join("`, `")}\`` : "- Missing in SDK request: none",
        extraInSdk.length > 0 ? `- Extra in SDK request: \`${extraInSdk.join("`, `")}\`` : "- Extra in SDK request: none",
        encodingMismatch ? "- Body encoding mismatch: SDK is not sending Postman-style form-urlencoded payloads." : "- Body encoding mismatch: none",
        authMismatch ? `- Active auth-style mismatch: current run resolves to \`${resolvedAuthStyle}\`, but Postman declares \`${postmanAuthSummary(postmanEntry.authStyles)}\`.` : "- Active auth-style mismatch: none",
      ].join("\n"));
    }
  }

  const unmatchedPostman = postmanEntries.filter(
    (postmanEntry) => !sdkEntries.some((sdkEntry) => sdkEntry.normalizedEndpoint === postmanEntry.normalizedEndpoint),
  );
  const unmatchedSdk = sdkEntries.filter(
    (sdkEntry) => sdkEntry.normalizedEndpoint && !postmanMap.has(sdkEntry.normalizedEndpoint),
  );

  for (const postmanEntry of unmatchedPostman) {
    const fuzzyMatch = unmatchedSdk.find(
      (sdkEntry) => staticEndpointBase(sdkEntry.normalizedEndpoint) === staticEndpointBase(postmanEntry.normalizedEndpoint)
        && staticEndpointBase(postmanEntry.normalizedEndpoint) !== "",
    );

    if (!fuzzyMatch) {
      continue;
    }

    pathMismatches.push([
      `### ${fuzzyMatch.qualifiedName}`,
      `- SDK endpoint: \`${fuzzyMatch.normalizedEndpoint}\``,
      `- Postman endpoint: \`${postmanEntry.normalizedEndpoint}\``,
      "- Likely issue: path parameters are missing or shaped differently in the SDK.",
    ].join("\n"));
  }

  return [
    "# Parameter Mismatches",
    "",
    `Generated at: ${generatedAt}`,
    `Resolved auth style for the current QA run: \`${resolvedAuthStyle}\``,
    "",
    "## Exact Endpoint Mismatches",
    "",
    ...(exactMismatches.length === 0 ? ["No exact endpoint request-shape mismatches were detected in this run."] : exactMismatches),
    "",
    "## Path Parameter Mismatches",
    "",
    ...(pathMismatches.length === 0 ? ["No path-parameter mismatches were detected in this run."] : pathMismatches),
    "",
  ].join("\n");
}

export function buildFailingApisReport(
  results: ExecutionResult[],
  resolvedAuthStyle: ResolvedAuthStyle,
  generatedAt: string,
): string {
  const failingResults = results.filter((result) => result.status === "failure");
  const groupedFailures = groupExecutionResultsByError(failingResults);

  return [
    "# Failing APIs",
    "",
    `Generated at: ${generatedAt}`,
    `Resolved auth style for the current QA run: \`${resolvedAuthStyle}\``,
    "",
    ...(failingResults.length === 0
      ? ["No failing SDK API executions were captured in this run."]
      : [
        "## Error Summary",
        "",
        ...groupedFailures.map((group) => `- ${group.title}: ${group.results.length} API${group.results.length === 1 ? "" : "s"}`),
        "",
        ...groupedFailures.flatMap((group) => [
          `## ${group.title}`,
          "",
          `- Affected APIs: ${group.results.length}`,
          "",
          "### API List",
          "",
          ...group.results.map((result) => `- \`${result.qualifiedName}\` -> \`${result.normalizedEndpoint}\``),
          "",
          "### Detailed Captures",
          "",
          ...group.results.map((result) => renderExecutionSection(result, "####")),
        ]),
      ]),
    "",
  ].join("\n");
}

export function buildNotTestableReport(
  results: ExecutionResult[],
  resolvedAuthStyle: ResolvedAuthStyle,
  generatedAt: string,
): string {
  const notTestableResults = results.filter((result) => result.status === "not-testable");

  return [
    "# Not Testable With Current Plan Or Credentials",
    "",
    `Generated at: ${generatedAt}`,
    `Resolved auth style for the current QA run: \`${resolvedAuthStyle}\``,
    "",
    ...(notTestableResults.length === 0
      ? ["No plan-restricted or quota-restricted SDK API executions were captured in this run."]
      : notTestableResults.map((result) => renderExecutionSection(result))),
    "",
  ].join("\n");
}

export function buildComparisonReport(
  results: ComparisonResult[],
  resolvedAuthStyle: ResolvedAuthStyle,
  generatedAt: string,
): string {
  const mismatches = results.filter((result) => !result.consistent && !result.skippedReason);
  const skipped = results.filter((result) => result.skippedReason);

  return [
    "# Inconsistent Responses",
    "",
    `Generated at: ${generatedAt}`,
    `Resolved auth style for the current QA run: \`${resolvedAuthStyle}\``,
    "",
    "## Mismatches",
    "",
    ...(mismatches.length === 0 ? ["No inconsistent SDK vs direct API responses were found in this compare run."] : mismatches.map(renderComparisonSection)),
    "",
    "## Skipped / Not Testable",
    "",
    ...(skipped.length === 0
      ? ["No compare candidates were skipped in this run."]
      : skipped.map((result) => [
        `### ${result.qualifiedName}`,
        `- Endpoint: \`${result.normalizedEndpoint}\``,
        `- Reason: ${result.skippedReason}`,
      ].join("\n"))),
    "",
  ].join("\n");
}

function renderEndpointList(endpoints: string[], emptyMessage: string): string[] {
  if (endpoints.length === 0) {
    return [emptyMessage];
  }

  return endpoints.map((endpoint) => `- \`${endpoint}\``);
}

function renderExecutionSection(result: ExecutionResult, heading = "##"): string {
  return [
    `${heading} ${result.qualifiedName}`,
    "",
    `- Endpoint: \`${result.normalizedEndpoint}\``,
    result.errorStatus !== undefined ? `- Status code: ${result.errorStatus}` : "- Status code: unavailable",
    result.errorName ? `- Error: \`${result.errorName}\`` : "- Error: unavailable",
    result.errorMessage ? `- Message: ${result.errorMessage}` : "- Message: unavailable",
    "",
    "### Request",
    "",
    formatJsonBlock({
      invocationArgs: result.invocationArgs,
      request: result.sdkRequest ?? null,
    }),
    "",
    "### Response",
    "",
    formatJsonBlock({
      sdkResponse: result.sdkResponse ?? null,
      resultSnapshot: result.resultSnapshot ?? null,
    }),
    "",
  ].join("\n");
}

function groupExecutionResultsByError(results: ExecutionResult[]): Array<{
  title: string;
  results: ExecutionResult[];
}> {
  const groups = new Map<string, { title: string; results: ExecutionResult[] }>();

  for (const result of results) {
    const title = buildErrorGroupTitle(result);
    const existing = groups.get(title);

    if (existing) {
      existing.results.push(result);
      continue;
    }

    groups.set(title, { title, results: [result] });
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      results: [...group.results].sort((left, right) => left.qualifiedName.localeCompare(right.qualifiedName)),
    }))
    .sort((left, right) => {
      if (right.results.length !== left.results.length) {
        return right.results.length - left.results.length;
      }
      return left.title.localeCompare(right.title);
    });
}

function buildErrorGroupTitle(result: ExecutionResult): string {
  const parts: string[] = [];

  if (result.errorStatus !== undefined) {
    parts.push(`HTTP ${result.errorStatus}`);
  }

  if (result.errorName) {
    parts.push(result.errorName);
  }

  if (result.errorMessage) {
    parts.push(summarizeMessage(result.errorMessage));
  }

  return parts.length > 0 ? parts.join(" | ") : "Unclassified Failure";
}

function summarizeMessage(message: string): string {
  const normalized = message.replace(/\s+/g, " ").trim();
  return normalized.length > 140 ? `${normalized.slice(0, 137)}...` : normalized;
}

function renderComparisonSection(result: ComparisonResult): string {
  return [
    `### ${result.qualifiedName}`,
    `- Endpoint: \`${result.normalizedEndpoint}\``,
    ...(result.notes.map((note) => `- Note: ${note}`)),
    result.diffLines.length > 0 ? `- Diff summary:\n${result.diffLines.map((line) => `  - ${line}`).join("\n")}` : "- Diff summary: none",
    "",
    "#### SDK Request / Response",
    "",
    formatJsonBlock({
      request: result.sdk.sdkRequest ?? null,
      response: result.sdk.sdkResponse ?? null,
      resultSnapshot: result.sdk.resultSnapshot ?? null,
    }),
    "",
    "#### Direct API Request / Response",
    "",
    formatJsonBlock({
      request: result.direct?.request ?? null,
      response: result.direct?.response ?? null,
      resultSnapshot: result.direct?.resultSnapshot ?? null,
    }),
    "",
  ].join("\n");
}
