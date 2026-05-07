import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export const ROOT_DIR = process.cwd();
export const SRC_DIR = join(ROOT_DIR, "src");
export const MOCK_DIR = join(ROOT_DIR, "mock");
export const TESTING_PLAN_PATH = join(MOCK_DIR, "testing-implementation-plan.md");
export const CATALOG_DIR = join(MOCK_DIR, "catalog");
export const DOCS_DIR = join(MOCK_DIR, "docs");
export const RESULTS_DIR = join(MOCK_DIR, "results");
export const TEST_DATA_DIR = join(MOCK_DIR, "test-data");

export const POSTMAN_COLLECTION_FILES = [
  "vedic_astrology_API_collection_postman_collection.json",
  "vedic_astrology_pdf_API_collection_postman_collection.json",
  "western_astrology_API_collection_postman_collection.json",
  "western_astrology_pdf_API_collection_postman_collection.json",
];

export async function ensureTestingDirectories(): Promise<void> {
  await Promise.all([
    mkdir(CATALOG_DIR, { recursive: true }),
    mkdir(DOCS_DIR, { recursive: true }),
    mkdir(RESULTS_DIR, { recursive: true }),
    mkdir(TEST_DATA_DIR, { recursive: true }),
  ]);
}

export async function writeTextFile(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf8");
}

export async function writeJsonFile(path: string, value: unknown): Promise<void> {
  await writeTextFile(path, `${JSON.stringify(value, null, 2)}\n`);
}
