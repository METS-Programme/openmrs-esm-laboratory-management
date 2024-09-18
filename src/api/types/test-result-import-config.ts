import { Concept } from "./concept/concept";

export interface TestResultImportConfig {
  uuid: string | null | undefined;
  dateCreated: Date;
  dateChanged: Date;
  headerHash: string | null | undefined;
  fieldMapping: string | null | undefined;
  test: Concept | null | undefined;
}

export interface TestResultImportConfigMappingHeaders {
  name: string;
  index: number;
  value: string;
}

export interface TestResultImportConceptMapping {
  concept?: string;
  scale?: number;
  value?: string;
  display?: string;
  setMembers?: Array<TestResultImportConceptMapping>;
  answers?: Array<TestResultImportConceptMapping>;
}

export interface TestResultImportConfigMapping {
  headers: Array<TestResultImportConfigMappingHeaders>;
  mapping: TestResultImportConceptMapping;
  separator: string;
  quote: string;
  sampleId: string;
}

export const DO_NOT_FILL_VALUE = "DO NOT FILL";
