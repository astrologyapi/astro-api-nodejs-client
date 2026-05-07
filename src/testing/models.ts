export type ApiDomain = "json" | "pdf";
export type BodyEncoding = "json" | "form-urlencoded" | "none" | "binary" | "unknown";
export type RunStatus = "success" | "failure" | "not-testable" | "skipped";
export type ResolvedAuthStyle = "header" | "basic";

export interface TestCredentials {
  userId: string;
  apiKey: string;
}

export interface BirthScenario {
  day: number;
  month: number;
  year: number;
  hour: number;
  min: number;
  lat: number;
  lon: number;
  tzone: number;
  name?: string;
  place?: string;
  gender?: string;
}

export interface MatchScenario {
  male: BirthScenario;
  female: BirthScenario;
  name?: string;
  partner_name?: string;
  place?: string;
}

export interface CoupleScenario {
  person1: BirthScenario;
  person2: BirthScenario;
  name?: string;
  partner_name?: string;
  place?: string;
}

export interface NumerologyScenario {
  day: number;
  month: number;
  year: number;
  name: string;
}

export interface PDFBrandingScenario {
  logo_url?: string;
  company_name?: string;
  company_info?: string;
  domain_url?: string;
  company_email?: string;
  company_landline?: string;
  company_mobile?: string;
  footer_link?: string;
  chart_style?: string;
}

export interface ZodiacPair {
  zodiac: string;
  partnerZodiac: string;
}

export interface ZodiacScenarioSet {
  primary: ZodiacPair;
  alternates: ZodiacPair[];
}

export interface TestScenarios {
  birthStandard: BirthScenario;
  birthNegativeTimezone: BirthScenario;
  birthFractionalTimezone: BirthScenario;
  birthDstSensitive: BirthScenario;
  birthEdgeDate: BirthScenario;
  matchBasic: MatchScenario;
  coupleBasic: CoupleScenario;
  numerologyBasic: NumerologyScenario;
  numerologyAlternate: NumerologyScenario;
  pdfBranding: PDFBrandingScenario;
  zodiacPairs: ZodiacScenarioSet;
}

export interface InvocationContext {
  birth: BirthScenario;
  match: MatchScenario;
  couple: CoupleScenario;
  numerology: NumerologyScenario;
  branding: PDFBrandingScenario;
  zodiacPair: ZodiacPair;
  planet: string;
  chartId: string;
  mahaDasha: string;
  vimshottariMahaDasha: string;
  vimshottariAntarDasha: string;
  vimshottariPratyantarDasha: string;
  vimshottariSookshmaDasha: string;
  placeQuery: string;
  maxRows: number;
  subjectName: string;
  partnerName: string;
  subjectPlace: string;
}

export interface InvocationPlan {
  args: unknown[];
  context: InvocationContext;
}

export interface ModuleDescriptor {
  module: string;
  getTarget: (client: unknown) => Record<string, unknown>;
}

export interface SDKMethodDescriptor {
  module: string;
  method: string;
  parameterNames: string[];
}

export interface CapturedRequest {
  url: string;
  endpoint: string;
  normalizedEndpoint: string;
  domain: ApiDomain;
  headers: Record<string, string>;
  body: Record<string, unknown>;
  rawBody?: string;
  encoding: BodyEncoding;
}

export interface CapturedResponse {
  status: number;
  ok: boolean;
  headers: Record<string, string>;
  body: unknown;
  bodyType: "json" | "text" | "pdf" | "unknown";
}

export interface SDKMethodInventory {
  module: string;
  method: string;
  qualifiedName: string;
  parameterNames: string[];
  endpoint: string;
  normalizedEndpoint: string;
  domain: ApiDomain;
  requestBody: Record<string, unknown>;
  requestFields: string[];
  requestEncoding: BodyEncoding;
  requestHeaders: Record<string, string>;
  resolvedAuthStyle: ResolvedAuthStyle;
  invocationArgs: unknown[];
  invocationError?: string;
  notes: string[];
}

export interface PostmanParameter {
  key: string;
  value?: string;
  disabled: boolean;
}

export interface PostmanEndpointInventory {
  normalizedEndpoint: string;
  endpoint: string;
  domain: ApiDomain;
  method: string;
  displayNames: string[];
  sourceFiles: string[];
  bodyMode: string;
  bodyParameters: PostmanParameter[];
  pathParameters: string[];
  authStyles: ResolvedAuthStyle[];
  headerKeys: string[];
}

export interface ExecutionResult {
  module: string;
  method: string;
  qualifiedName: string;
  normalizedEndpoint: string;
  status: RunStatus;
  resolvedAuthStyle: ResolvedAuthStyle;
  invocationArgs: unknown[];
  sdkRequest?: CapturedRequest;
  sdkResponse?: CapturedResponse;
  resultSnapshot?: unknown;
  responseShape?: unknown;
  errorName?: string;
  errorMessage?: string;
  errorStatus?: number;
}

export interface DirectExecutionResult {
  normalizedEndpoint: string;
  resolvedAuthStyle: ResolvedAuthStyle;
  status: RunStatus;
  request: CapturedRequest;
  response?: CapturedResponse;
  resultSnapshot?: unknown;
  errorName?: string;
  errorMessage?: string;
  errorStatus?: number;
}

export interface ComparisonResult {
  module: string;
  method: string;
  qualifiedName: string;
  normalizedEndpoint: string;
  resolvedAuthStyle: ResolvedAuthStyle;
  consistent: boolean;
  skippedReason?: string;
  sdk: ExecutionResult;
  direct?: DirectExecutionResult;
  diffLines: string[];
  notes: string[];
}
