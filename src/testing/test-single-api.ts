import type {
  BodyEncoding,
  ComparisonResult,
  DirectExecutionResult,
  ExecutionResult,
  PostmanParameter,
  PostmanEndpointInventory,
  SDKMethodInventory,
} from "./models.js";
import {
  getTestCredentials,
  getTimestampLabel,
  inferResolvedAuthStyle,
  loadLocalEnv,
} from "./env.js";
import {buildInvocationPlan} from "./invocation.js";
import {buildPostmanInventory} from "./postman.js";
import {
  compareExecutionResults,
  executeDirectRequest,
  executeDirectRequestFromResolvedEndpoint,
  executeSdkMethod,
} from "./runners.js";
import {buildSdkInventory} from "./sdk-inventory.js";
import {loadTestScenarios} from "./test-data.js";

/**
 * Edit these two values before running `npm run qa:single`.
 *
 * SDK target format:
 * - "vedic.getPlanets"
 * - "western.getSynastry"
 * - "pdf.western.getSynastry"
 *
 * Direct target lookup can be:
 * - a normalized Postman endpoint such as "planets"
 * - a raw collection endpoint such as "horo_chart/:chartId"
 * - a Postman item name fragment
 *
 * Leave DIRECT_TARGET_LOOKUP empty to reuse the SDK normalized endpoint.
 */
const SDK_TARGET = "vedic.getVarshaphalMuntha";
const DIRECT_TARGET_LOOKUP = "";
const INVOCATION_STRATEGY = "deterministic" as const;

async function main(): Promise<void> {
  await loadLocalEnv();

  const generatedAt = getTimestampLabel();
  const credentials = getTestCredentials();
  const resolvedAuthStyle = inferResolvedAuthStyle(credentials.apiKey);
  const scenarios = await loadTestScenarios();
  const sdkEntries = await buildSdkInventory(scenarios, resolvedAuthStyle);
  const postmanEntries = await buildPostmanInventory();

  const sdkEntry = resolveSdkEntry(sdkEntries, SDK_TARGET);
  const directLookup =
    DIRECT_TARGET_LOOKUP.trim() || sdkEntry.normalizedEndpoint;
  const directResolution = resolvePostmanEntry(postmanEntries, directLookup);
  const plan = buildInvocationPlan(
    sdkEntry.module,
    sdkEntry.method,
    sdkEntry.parameterNames,
    scenarios,
    INVOCATION_STRATEGY,
  );

  printSection("Single API Debugger");
  printJson({
    generatedAt,
    sdkTarget: SDK_TARGET,
    directTargetLookup: directLookup,
    resolvedAuthStyle,
    invocationStrategy: INVOCATION_STRATEGY,
  });

  printSection("Resolved SDK Target");
  printJson({
    qualifiedName: sdkEntry.qualifiedName,
    normalizedEndpoint: sdkEntry.normalizedEndpoint,
    parameterNames: sdkEntry.parameterNames,
    requestFields: sdkEntry.requestFields,
    requestEncoding: sdkEntry.requestEncoding,
  });

  printSection("Resolved Direct Target");
  printJson(buildDirectResolutionSummary(directResolution, sdkEntry));

  printSection("Invocation Arguments");
  printJson({
    args: plan.args,
    context: plan.context,
  });

  const sdkResult = await executeSdkMethod(sdkEntry, credentials, plan);
  printExecutionResult("SDK Execution", sdkResult);

  const initialDirectResult = directResolution.entry
    ? await executeDirectRequest(
        directResolution.entry,
        directResolution.entry.normalizedEndpoint,
        credentials,
        plan,
      )
    : await executeDirectRequestFromResolvedEndpoint(
        sdkResult.sdkRequest?.endpoint ?? sdkEntry.endpoint,
        sdkResult.sdkRequest?.normalizedEndpoint ?? sdkEntry.normalizedEndpoint,
        sdkResult.sdkRequest?.domain ?? sdkEntry.domain,
        normaliseFallbackBodySnapshot(
          sdkResult.sdkRequest?.body ?? sdkEntry.requestBody,
        ),
        sdkResult.sdkRequest?.encoding ?? sdkEntry.requestEncoding,
        credentials,
      );

  let directResult = initialDirectResult;

  if (
    directResolution.entry &&
    shouldRetryWithSdkFallback(initialDirectResult, sdkResult) &&
    sdkResult.sdkRequest
  ) {
    printDirectExecutionResult(
      "Direct API Execution (Postman)",
      initialDirectResult,
    );

    directResult = await executeDirectRequestFromResolvedEndpoint(
      sdkResult.sdkRequest.endpoint ?? sdkEntry.endpoint,
      sdkResult.sdkRequest.normalizedEndpoint ?? sdkEntry.normalizedEndpoint,
      sdkResult.sdkRequest.domain ?? sdkEntry.domain,
      normaliseFallbackBodySnapshot(
        sdkResult.sdkRequest.body ?? sdkEntry.requestBody,
      ),
      sdkResult.sdkRequest.encoding ?? sdkEntry.requestEncoding,
      credentials,
    );

    printSection("Fallback Decision");
    printJson({
      reason:
        "Retried direct API execution with the SDK-resolved request body because the Postman-derived body failed validation for fields present in the SDK request.",
      missingFields: findSdkOnlyValidationFields(
        initialDirectResult,
        sdkResult,
      ),
    });

    printDirectExecutionResult(
      "Direct API Execution (SDK Fallback)",
      directResult,
    );
  } else {
    printDirectExecutionResult("Direct API Execution", directResult);
  }

  const comparison = compareExecutionResults(sdkResult, directResult);
  printComparisonResult(comparison);

  if (!comparison.consistent || comparison.skippedReason) {
    process.exitCode = 1;
  }
}

function resolveSdkEntry(
  entries: SDKMethodInventory[],
  target: string,
): SDKMethodInventory {
  const exact = entries.find((entry) => entry.qualifiedName === target.trim());
  if (exact) {
    return exact;
  }

  const suggestions = entries
    .map((entry) => entry.qualifiedName)
    .filter((qualifiedName) =>
      qualifiedName.toLowerCase().includes(target.trim().toLowerCase()),
    )
    .slice(0, 12);

  throw new Error(
    [
      `SDK target "${target}" was not found.`,
      suggestions.length > 0
        ? `Closest SDK matches: ${suggestions.join(", ")}`
        : "No similar SDK methods were found.",
    ].join("\n"),
  );
}

function resolvePostmanEntry(
  entries: PostmanEndpointInventory[],
  lookup: string,
): {
  entry?: PostmanEndpointInventory;
  suggestions: string[];
  fallbackReason?: string;
} {
  const normalizedLookup = lookup.trim().toLowerCase();
  const exact = entries.find((entry) =>
    matchesPostmanLookup(entry, normalizedLookup, false),
  );
  if (exact) {
    return {entry: exact, suggestions: []};
  }

  const suggestions = entries
    .filter((entry) => matchesPostmanLookup(entry, normalizedLookup, true))
    .map((entry) => entry.normalizedEndpoint)
    .slice(0, 12);

  return {
    suggestions,
    fallbackReason: `Direct API target "${lookup}" was not found in the Postman inventory.`,
  };
}

function matchesPostmanLookup(
  entry: PostmanEndpointInventory,
  lookup: string,
  fuzzy: boolean,
): boolean {
  const candidates = [
    entry.normalizedEndpoint,
    entry.endpoint,
    ...entry.displayNames,
  ].map((value) => value.toLowerCase());

  if (fuzzy) {
    return candidates.some((candidate) => candidate.includes(lookup));
  }

  return candidates.some((candidate) => candidate === lookup);
}

function shouldRetryWithSdkFallback(
  directResult: DirectExecutionResult,
  sdkResult: ExecutionResult,
): boolean {
  if (directResult.status !== "failure" || sdkResult.status !== "success") {
    return false;
  }

  return findSdkOnlyValidationFields(directResult, sdkResult).length > 0;
}

function findSdkOnlyValidationFields(
  directResult: DirectExecutionResult,
  sdkResult: ExecutionResult,
): string[] {
  const validationFields = extractValidationFieldKeys(
    directResult.response?.body,
  );
  if (validationFields.length === 0) {
    return [];
  }

  const sdkBody = sdkResult.sdkRequest?.body ?? {};
  const directBody = directResult.request.body ?? {};

  return validationFields.filter(
    (field) => field in sdkBody && !(field in directBody),
  );
}

function extractValidationFieldKeys(body: unknown): string[] {
  if (typeof body !== "object" || body === null || !("error" in body)) {
    return [];
  }

  const errorList = (body as {error?: unknown}).error;
  if (!Array.isArray(errorList)) {
    return [];
  }

  const keys = errorList
    .map((entry) => {
      if (
        typeof entry !== "object" ||
        entry === null ||
        !("context" in entry)
      ) {
        return undefined;
      }

      const context = (entry as {context?: unknown}).context;
      if (
        typeof context !== "object" ||
        context === null ||
        !("key" in context)
      ) {
        return undefined;
      }

      const key = (context as {key?: unknown}).key;
      return typeof key === "string" ? key : undefined;
    })
    .filter((value): value is string => Boolean(value));

  return [...new Set(keys)];
}

function printExecutionResult(title: string, result: ExecutionResult): void {
  printSection(title);
  printJson({
    status: result.status,
    errorStatus: result.errorStatus,
    errorName: result.errorName,
    errorMessage: result.errorMessage,
    request: result.sdkRequest ?? null,
    response: result.sdkResponse ?? null,
    resultSnapshot: result.resultSnapshot ?? null,
    responseShape: result.responseShape ?? null,
  });
}

function printDirectExecutionResult(
  title: string,
  result: DirectExecutionResult,
): void {
  printSection(title);
  printJson({
    status: result.status,
    errorStatus: result.errorStatus,
    errorName: result.errorName,
    errorMessage: result.errorMessage,
    request: result.request,
    response: result.response ?? null,
    resultSnapshot: result.resultSnapshot ?? null,
  });
}

function printComparisonResult(result: ComparisonResult): void {
  printSection("Comparison Summary");
  printJson({
    consistent: result.consistent,
    skippedReason: result.skippedReason ?? null,
    diffCount: result.diffLines.length,
    diffLines: result.diffLines,
    notes: result.notes,
  });
}

function buildDirectResolutionSummary(
  resolution: {
    entry?: PostmanEndpointInventory;
    suggestions: string[];
    fallbackReason?: string;
  },
  sdkEntry: SDKMethodInventory,
): Record<string, unknown> {
  if (resolution.entry) {
    return {
      resolutionStrategy: "postman",
      normalizedEndpoint: resolution.entry.normalizedEndpoint,
      endpoint: resolution.entry.endpoint,
      displayNames: resolution.entry.displayNames,
      bodyMode: resolution.entry.bodyMode,
      bodyParameters: resolution.entry.bodyParameters
        .filter((parameter) => !parameter.disabled)
        .map((parameter) => parameter.key),
      authStyles: resolution.entry.authStyles,
    };
  }

  return {
    resolutionStrategy: "sdk-fallback",
    fallbackReason: resolution.fallbackReason,
    sdkEndpoint: sdkEntry.endpoint,
    sdkNormalizedEndpoint: sdkEntry.normalizedEndpoint,
    sdkDomain: sdkEntry.domain,
    sdkRequestEncoding: sdkEntry.requestEncoding,
    sdkRequestFields: sdkEntry.requestFields,
    suggestions: resolution.suggestions,
  };
}

function normaliseFallbackBodySnapshot(
  body: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== undefined),
  );
}

function printSection(title: string): void {
  console.log(`\n=== ${title} ===`);
}

function printJson(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

await main().catch((error) => {
  console.error("\n=== Fatal Error ===");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
