import { join } from "node:path";
import { getCompareCount, getTestCredentials, getTimestampLabel, inferResolvedAuthStyle, loadLocalEnv } from "./env.js";
import { buildInvocationPlan } from "./invocation.js";
import { buildPostmanInventory } from "./postman.js";
import { buildComparisonReport } from "./reporting.js";
import { compareExecutionResults, executeDirectRequest, executeSdkMethod } from "./runners.js";
import { buildSdkInventory } from "./sdk-inventory.js";
import { loadTestScenarios } from "./test-data.js";
import { RESULTS_DIR, ensureTestingDirectories, writeTextFile } from "./paths.js";

async function main(): Promise<void> {
  await loadLocalEnv();
  await ensureTestingDirectories();

  const generatedAt = getTimestampLabel();
  const credentials = getTestCredentials();
  const resolvedAuthStyle = inferResolvedAuthStyle(credentials.apiKey);
  const compareCount = getCompareCount();
  const scenarios = await loadTestScenarios();
  const postmanEntries = await buildPostmanInventory();
  const postmanMap = new Map(postmanEntries.map((entry) => [entry.normalizedEndpoint, entry]));
  const sdkEntries = await buildSdkInventory(scenarios, resolvedAuthStyle);
  const candidates = shuffle(
    sdkEntries.filter((entry) => entry.normalizedEndpoint && postmanMap.has(entry.normalizedEndpoint)),
  ).slice(0, compareCount);

  const comparisonResults = [];

  for (const [index, entry] of candidates.entries()) {
    const plan = buildInvocationPlan(entry.module, entry.method, entry.parameterNames, scenarios, "random");
    const sdkResult = await executeSdkMethod(entry, credentials, plan);
    const directEntry = postmanMap.get(entry.normalizedEndpoint);
    const directResult = directEntry
      ? await executeDirectRequest(directEntry, entry.normalizedEndpoint, credentials, plan)
      : undefined;
    comparisonResults.push(compareExecutionResults(sdkResult, directResult));
    console.log(`[test-sdk-compare] Compared ${index + 1}/${candidates.length} -> ${entry.qualifiedName}`);
  }

  await writeTextFile(
    join(RESULTS_DIR, "inconsistent-responses.md"),
    buildComparisonReport(comparisonResults, resolvedAuthStyle, generatedAt),
  );

  const summary = {
    total: comparisonResults.length,
    mismatches: comparisonResults.filter((result) => !result.consistent && !result.skippedReason).length,
    skipped: comparisonResults.filter((result) => Boolean(result.skippedReason)).length,
  };

  console.log(`[test-sdk-compare] Completed. mismatches=${summary.mismatches} skipped=${summary.skipped} total=${summary.total}`);
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

await main();
