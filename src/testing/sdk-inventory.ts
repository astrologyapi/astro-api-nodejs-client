import type { ResolvedAuthStyle, SDKMethodInventory, TestScenarios } from "./models.js";
import { captureRequest, makeStubResponse } from "./http-capture.js";
import { buildInvocationPlan, createClient, getClientMethod, listSdkMethodDescriptors } from "./invocation.js";
import { normalizeSdkEndpoint } from "./normalize.js";

export async function buildSdkInventory(
  scenarios: TestScenarios,
  resolvedAuthStyle: ResolvedAuthStyle,
): Promise<SDKMethodInventory[]> {
  const sampleApiKey = resolvedAuthStyle === "header" ? "ak-sdk-inventory-key" : "sdk-inventory-key";
  const client = createClient("sdk-inventory-user", sampleApiKey);
  const methodDescriptors = listSdkMethodDescriptors(client);
  const inventory: SDKMethodInventory[] = [];

  for (const descriptor of methodDescriptors) {
    const qualifiedName = `${descriptor.module}.${descriptor.method}`;
    const plan = buildInvocationPlan(descriptor.module, descriptor.method, descriptor.parameterNames, scenarios, "deterministic");

    try {
      const captured = await captureSdkRequest(client, descriptor.module, descriptor.method, plan.args);
      inventory.push({
        module: descriptor.module,
        method: descriptor.method,
        qualifiedName,
        parameterNames: descriptor.parameterNames,
        endpoint: captured.endpoint,
        normalizedEndpoint: normalizeSdkEndpoint(captured.endpoint, descriptor.parameterNames, plan.args),
        domain: captured.domain,
        requestBody: captured.body,
        requestFields: Object.keys(captured.body).sort(),
        requestEncoding: captured.encoding,
        requestHeaders: captured.headers,
        resolvedAuthStyle,
        invocationArgs: plan.args,
        notes: [],
      });
    } catch (error) {
      inventory.push({
        module: descriptor.module,
        method: descriptor.method,
        qualifiedName,
        parameterNames: descriptor.parameterNames,
        endpoint: "",
        normalizedEndpoint: "",
        domain: descriptor.module.startsWith("pdf.") ? "pdf" : "json",
        requestBody: {},
        requestFields: [],
        requestEncoding: "unknown",
        requestHeaders: {},
        resolvedAuthStyle,
        invocationArgs: plan.args,
        invocationError: error instanceof Error ? error.message : String(error),
        notes: ["Unable to capture SDK request during inventory generation."],
      });
    }
  }

  return inventory;
}

async function captureSdkRequest(
  client: ReturnType<typeof createClient>,
  moduleName: string,
  methodName: string,
  args: unknown[],
) {
  const originalFetch = globalThis.fetch;
  let capturedRequest: ReturnType<typeof captureRequest> | undefined;

  globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
    capturedRequest = captureRequest(input, init);
    return makeStubResponse(capturedRequest.domain);
  };

  try {
    const method = getClientMethod(client, moduleName, methodName);
    await method(...args);

    if (!capturedRequest) {
      throw new Error(`No request captured for ${moduleName}.${methodName}`);
    }

    return capturedRequest;
  } finally {
    globalThis.fetch = originalFetch;
  }
}
