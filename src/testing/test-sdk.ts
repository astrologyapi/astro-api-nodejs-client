import { join } from "node:path";
import { buildSdkModulesDocument, buildTestGuide } from "./docs.js";
import { getTestCredentials, getTimestampLabel, inferResolvedAuthStyle, loadLocalEnv } from "./env.js";
import { buildInvocationPlan } from "./invocation.js";
import { buildPostmanInventory } from "./postman.js";
import {
  buildFailingApisReport,
  buildMissingApisReport,
  buildNotTestableReport,
  buildParameterMismatchReport,
} from "./reporting.js";
import { executeSdkMethod } from "./runners.js";
import { buildSdkInventory } from "./sdk-inventory.js";
import { loadTestScenarios } from "./test-data.js";
import {
  CATALOG_DIR,
  DOCS_DIR,
  RESULTS_DIR,
  ensureTestingDirectories,
  writeJsonFile,
  writeTextFile,
} from "./paths.js";

async function main(): Promise<void> {
  await loadLocalEnv();
  await ensureTestingDirectories();

  const generatedAt = getTimestampLabel();
  const credentials = getTestCredentials();
  const resolvedAuthStyle = inferResolvedAuthStyle(credentials.apiKey);
  const scenarios = await loadTestScenarios();
  const postmanEntries = await buildPostmanInventory();
  const sdkEntries = await buildSdkInventory(scenarios, resolvedAuthStyle);

  await writeJsonFile(join(CATALOG_DIR, "postman-endpoints.json"), postmanEntries);
  await writeJsonFile(join(CATALOG_DIR, "sdk-endpoints.json"), sdkEntries);

  await writeTextFile(
    join(RESULTS_DIR, "missing-apis.md"),
    buildMissingApisReport(postmanEntries, sdkEntries, resolvedAuthStyle, generatedAt),
  );
  await writeTextFile(
    join(RESULTS_DIR, "parameter-mismatches.md"),
    buildParameterMismatchReport(postmanEntries, sdkEntries, resolvedAuthStyle, generatedAt),
  );

  const executionResults = [];

  for (const [index, entry] of sdkEntries.entries()) {
    const plan = buildInvocationPlan(entry.module, entry.method, entry.parameterNames, scenarios, "deterministic");
    const result = await executeSdkMethod(entry, credentials, plan);
    executionResults.push(result);

    if ((index + 1) % 10 === 0 || index === sdkEntries.length - 1) {
      console.log(`[test-sdk] Processed ${index + 1}/${sdkEntries.length} SDK methods`);
    }
  }

  await writeTextFile(
    join(RESULTS_DIR, "failing-apis.md"),
    buildFailingApisReport(executionResults, resolvedAuthStyle, generatedAt),
  );
  await writeTextFile(
    join(RESULTS_DIR, "not-testable-with-current-plan.md"),
    buildNotTestableReport(executionResults, resolvedAuthStyle, generatedAt),
  );
  await writeTextFile(
    join(CATALOG_DIR, "sdk-modules.md"),
    buildSdkModulesDocument(sdkEntries, postmanEntries, executionResults, resolvedAuthStyle, generatedAt),
  );
  await writeTextFile(
    join(DOCS_DIR, "test-sdk.md"),
    buildTestGuide(resolvedAuthStyle, generatedAt),
  );

  const summary = {
    total: executionResults.length,
    success: executionResults.filter((result) => result.status === "success").length,
    failure: executionResults.filter((result) => result.status === "failure").length,
    notTestable: executionResults.filter((result) => result.status === "not-testable").length,
  };

  console.log(`[test-sdk] Completed. success=${summary.success} failure=${summary.failure} not-testable=${summary.notTestable} total=${summary.total}`);
}

await main();
