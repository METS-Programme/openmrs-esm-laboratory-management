import { RadioOption } from "./radio-option";
import { RecordPermission } from "./record-permission";

export interface TestConfig {
  uuid: string | null | undefined;
  requireApproval: boolean | null | undefined;
  enabled: boolean | null | undefined;
  testUuid: string | null | undefined;
  testName: string | null | undefined;
  testShortName: string | null | undefined;
  approvalFlowUuid: string | null | undefined;
  approvalFlowName: string | null | undefined;
  testGroupUuid: string | null | undefined;
  testGroupName: string | null | undefined;
  dateCreated: Date | null | undefined;
  creatorGivenName: string | null | undefined;
  creatorFamilyName: string | null | undefined;
  permission: RecordPermission;
}

export const requireApprovalOptions: RadioOption[] = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];

export interface TestConfigImportResult {
  createdCount: number;
  updatedCount: number;
  uploadSessionId: string;
  hasErrorFile: boolean;
  success: boolean;
  errors: string[];
  exception: any;
  notChangedCount: number;
}
