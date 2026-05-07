import {PlanRestrictedError, QuotaExceededError} from "../errors.js";
import type {
  ApiDomain,
  BodyEncoding,
  CapturedRequest,
  ComparisonResult,
  DirectExecutionResult,
  ExecutionResult,
  InvocationPlan,
  PostmanEndpointInventory,
  ResolvedAuthStyle,
  SDKMethodInventory,
  TestCredentials,
} from "./models.js";
import {inferResolvedAuthStyle} from "./env.js";
import {captureRequest, captureResponse} from "./http-capture.js";
import {createClient, getClientMethod} from "./invocation.js";
import {buildDirectRequestBody, materialiseDirectEndpoint} from "./postman.js";
import {
  diffValues,
  inferShape,
  isNotTestableStatus,
  normalizeSdkEndpoint,
  serialiseResult,
  sortDeep,
} from "./normalize.js";

const BASE_URLS = {
  json: "https://json.astrologyapi.com/v1",
  pdf: "https://pdf.astrologyapi.com/v1",
} as const;

export async function executeSdkMethod(
  entry: SDKMethodInventory,
  credentials: TestCredentials,
  plan: InvocationPlan,
): Promise<ExecutionResult> {
  const resolvedAuthStyle = inferResolvedAuthStyle(credentials.apiKey);
  const client = createClient(credentials.userId, credentials.apiKey);
  const method = getClientMethod(client, entry.module, entry.method);
  const originalFetch = globalThis.fetch;
  let sdkRequest: CapturedRequest | undefined;
  let sdkResponse: Awaited<ReturnType<typeof captureResponse>> | undefined;

  globalThis.fetch = async (
    input: string | URL | Request,
    init?: RequestInit,
  ) => {
    sdkRequest = captureRequest(input, init);
    sdkRequest.normalizedEndpoint = normalizeSdkEndpoint(
      sdkRequest.endpoint,
      entry.parameterNames,
      plan.args,
    );

    const response = await originalFetch(input, init);
    sdkResponse = await captureResponse(response.clone(), sdkRequest.domain);
    return response;
  };

  try {
    const result = await method(...plan.args);
    const resultSnapshot = serialiseResult(result);

    return {
      module: entry.module,
      method: entry.method,
      qualifiedName: entry.qualifiedName,
      normalizedEndpoint: entry.normalizedEndpoint,
      status: "success",
      resolvedAuthStyle,
      invocationArgs: plan.args,
      sdkRequest,
      sdkResponse,
      resultSnapshot,
      responseShape: inferShape(resultSnapshot),
    };
  } catch (error) {
    const errorStatus = extractErrorStatus(error);
    const status =
      isNotTestableStatus(errorStatus) ||
      error instanceof QuotaExceededError ||
      error instanceof PlanRestrictedError
        ? "not-testable"
        : "failure";

    return {
      module: entry.module,
      method: entry.method,
      qualifiedName: entry.qualifiedName,
      normalizedEndpoint: entry.normalizedEndpoint,
      status,
      resolvedAuthStyle,
      invocationArgs: plan.args,
      sdkRequest,
      sdkResponse,
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStatus,
    };
  } finally {
    globalThis.fetch = originalFetch;
  }
}

export async function executeDirectRequest(
  postmanEntry: PostmanEndpointInventory,
  normalizedEndpoint: string,
  credentials: TestCredentials,
  plan: InvocationPlan,
): Promise<DirectExecutionResult> {
  const resolvedAuthStyle = inferResolvedAuthStyle(credentials.apiKey);
  const endpoint = materialiseDirectEndpoint(postmanEntry, plan.context);
  const url = `${BASE_URLS[postmanEntry.domain]}/${endpoint}`;
  const body = new URLSearchParams(
    buildDirectRequestBody(postmanEntry, plan.context),
  );
  const headers = buildDirectHeaders(credentials, resolvedAuthStyle);
  headers["content-type"] = "application/x-www-form-urlencoded";

  const request = captureRequest(url, {
    method: "POST",
    headers,
    body,
  });
  request.normalizedEndpoint = normalizedEndpoint;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
    });

    const responseSnapshot = await captureResponse(
      response.clone(),
      postmanEntry.domain,
    );
    const status = isNotTestableStatus(response.status)
      ? "not-testable"
      : response.ok
        ? "success"
        : "failure";

    return {
      normalizedEndpoint,
      resolvedAuthStyle,
      status,
      request,
      response: responseSnapshot,
      resultSnapshot: responseSnapshot.body,
      errorStatus: response.ok ? undefined : response.status,
      errorMessage: response.ok ? undefined : String(responseSnapshot.body),
    };
  } catch (error) {
    return {
      normalizedEndpoint,
      resolvedAuthStyle,
      status: "failure",
      request,
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function executeDirectRequestFromResolvedEndpoint(
  endpoint: string,
  normalizedEndpoint: string,
  domain: ApiDomain,
  bodySnapshot: Record<string, unknown>,
  encoding: BodyEncoding,
  credentials: TestCredentials,
): Promise<DirectExecutionResult> {
  const resolvedAuthStyle = inferResolvedAuthStyle(credentials.apiKey);
  const url = `${BASE_URLS[domain]}/${endpoint}`;
  const {headers, body} = buildRawDirectRequestPayload(
    credentials,
    resolvedAuthStyle,
    bodySnapshot,
    encoding,
  );

  const request = captureRequest(url, {
    method: "POST",
    headers,
    body,
  });
  request.normalizedEndpoint = normalizedEndpoint;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
    });

    const responseSnapshot = await captureResponse(response.clone(), domain);
    const status = isNotTestableStatus(response.status)
      ? "not-testable"
      : response.ok
        ? "success"
        : "failure";

    return {
      normalizedEndpoint,
      resolvedAuthStyle,
      status,
      request,
      response: responseSnapshot,
      resultSnapshot: responseSnapshot.body,
      errorStatus: response.ok ? undefined : response.status,
      errorMessage: response.ok ? undefined : String(responseSnapshot.body),
    };
  } catch (error) {
    return {
      normalizedEndpoint,
      resolvedAuthStyle,
      status: "failure",
      request,
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
}

export function compareExecutionResults(
  sdkResult: ExecutionResult,
  directResult: DirectExecutionResult | undefined,
): ComparisonResult {
  if (!directResult) {
    return {
      module: sdkResult.module,
      method: sdkResult.method,
      qualifiedName: sdkResult.qualifiedName,
      normalizedEndpoint: sdkResult.normalizedEndpoint,
      resolvedAuthStyle: sdkResult.resolvedAuthStyle,
      consistent: false,
      sdk: sdkResult,
      diffLines: [
        "Direct API request could not be prepared for this endpoint.",
      ],
      notes: [],
    };
  }

  if (
    sdkResult.status === "not-testable" ||
    directResult.status === "not-testable"
  ) {
    return {
      module: sdkResult.module,
      method: sdkResult.method,
      qualifiedName: sdkResult.qualifiedName,
      normalizedEndpoint: sdkResult.normalizedEndpoint,
      resolvedAuthStyle: sdkResult.resolvedAuthStyle,
      consistent: false,
      skippedReason:
        "Endpoint is not testable with the current plan/credentials.",
      sdk: sdkResult,
      direct: directResult,
      diffLines: [],
      notes: [],
    };
  }

  if (sdkResult.sdkRequest?.domain === "pdf") {
    const sdkPdfOk =
      sdkResult.status === "success" &&
      isSuccessfulPdfResponse(sdkResult.sdkResponse);
    const directPdfOk =
      directResult.status === "success" &&
      isSuccessfulPdfResponse(directResult.response);

    return {
      module: sdkResult.module,
      method: sdkResult.method,
      qualifiedName: sdkResult.qualifiedName,
      normalizedEndpoint: sdkResult.normalizedEndpoint,
      resolvedAuthStyle: sdkResult.resolvedAuthStyle,
      consistent: sdkPdfOk && directPdfOk,
      sdk: sdkResult,
      direct: directResult,
      diffLines:
        sdkPdfOk && directPdfOk
          ? []
          : [
              "PDF validation failed for either the SDK response or the direct API response.",
            ],
      notes: [
        "PDF endpoints are validated by either a non-empty binary PDF response or a successful JSON response containing a pdf_url.",
      ],
    };
  }

  const sdkComparable = sortDeep(
    sdkResult.resultSnapshot ?? sdkResult.sdkResponse?.body,
  );
  const directComparable = sortDeep(
    directResult.resultSnapshot ?? directResult.response?.body,
  );
  const diffLines = diffValues(sdkComparable, directComparable);

  return {
    module: sdkResult.module,
    method: sdkResult.method,
    qualifiedName: sdkResult.qualifiedName,
    normalizedEndpoint: sdkResult.normalizedEndpoint,
    resolvedAuthStyle: sdkResult.resolvedAuthStyle,
    consistent:
      sdkResult.status === directResult.status && diffLines.length === 0,
    sdk: sdkResult,
    direct: directResult,
    diffLines,
    notes: [],
  };
}

function buildDirectHeaders(
  credentials: TestCredentials,
  resolvedAuthStyle: ResolvedAuthStyle,
): Record<string, string> {
  if (resolvedAuthStyle === "basic") {
    return {
      authorization: `Basic ${Buffer.from(`${credentials.userId}:${credentials.apiKey}`).toString("base64")}`,
    };
  }

  return {
    "x-astrologyapi-key": credentials.apiKey,
  };
}

function buildRawDirectRequestPayload(
  credentials: TestCredentials,
  resolvedAuthStyle: ResolvedAuthStyle,
  bodySnapshot: Record<string, unknown>,
  encoding: BodyEncoding,
): {headers: Record<string, string>; body: string | URLSearchParams} {
  const headers = buildDirectHeaders(credentials, resolvedAuthStyle);

  if (encoding === "form-urlencoded") {
    headers["content-type"] = "application/x-www-form-urlencoded";

    return {
      headers,
      body: new URLSearchParams(
        Object.entries(bodySnapshot).map(([key, value]) => [
          key,
          String(value),
        ]),
      ),
    };
  }

  headers["content-type"] = "application/json";

  return {
    headers,
    body: JSON.stringify(bodySnapshot),
  };
}

function extractErrorStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as {status?: unknown}).status;
    return typeof status === "number" ? status : undefined;
  }

  return undefined;
}

function hasPositiveByteLength(value: unknown): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const byteLength = (value as {byteLength?: unknown}).byteLength;
  return typeof byteLength === "number" && byteLength > 0;
}

function isSuccessfulPdfResponse(
  response: ExecutionResult["sdkResponse"] | DirectExecutionResult["response"],
): boolean {
  if (!response) {
    return false;
  }

  if (response.bodyType === "pdf") {
    return hasPositiveByteLength(response.body);
  }

  if (
    response.bodyType === "json" &&
    typeof response.body === "object" &&
    response.body !== null
  ) {
    const body = response.body as {status?: unknown; pdf_url?: unknown};
    return (
      body.status === true &&
      typeof body.pdf_url === "string" &&
      body.pdf_url.length > 0
    );
  }

  return false;
}
