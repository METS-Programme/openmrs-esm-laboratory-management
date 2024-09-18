import { ApprovalActionType } from "./approval-action";
import { Sample } from "./sample";
import { TestRequestItem } from "./test-request-item";

export interface TestRequest {
  uuid?: string;
  patientUuid?: string;
  patientIdentifier?: string;
  patientGivenName?: string;
  patientMiddleName?: string;
  patientFamilyName?: string;
  providerUuid?: string;
  providerGivenName?: string;
  providerMiddleName?: string;
  providerFamilyName?: string;
  requestDate?: Date;
  requestNo?: string;
  urgency?: string;
  careSettingUuid?: string;
  careSettingName?: string;
  dateStopped?: Date;
  status?: string;
  atLocationUuid?: string;
  atLocationName?: string;
  referredIn?: boolean;
  referralFromFacilityUuid?: string;
  referralFromFacilityId?: number;
  referralFromFacilityName?: string;
  referralInExternalRef?: string;
  clinicalNote?: string;
  requestReason?: string;
  dateCreated?: Date;
  dateChanged?: Date;
  creatorUuid?: string;
  creatorGivenName?: string;
  creatorFamilyName?: string;
  changedByUuid?: string;
  changedByGivenName?: string;
  changedByFamilyName?: string;
  tests?: Array<TestRequestItem> | null;
  samples?: Array<Sample> | null;
}

export const TestRequestStatusInProgress = "IN_PROGRESS";
export const TestRequestStatusCancelled = "CANCELLED";
export const TestRequestStatusCompleted = "COMPLETED";
export const TestRequestStatuses = [
  TestRequestStatusInProgress,
  TestRequestStatusCancelled,
  TestRequestStatusCompleted,
] as const;
export type TestRequestStatusType = (typeof TestRequestStatuses)[number];

export const TestRequestActionTypeRequestApprove = "TEST_REQUEST_APPROVAL";
export const TestRequestActionTypeSampleRelease = "SAMPLE_RELEASE_FOR_TESTING";
export const TestResultActionTypeResultApprove = "TEST_RESULT_APPROVAL";
export const TestResultActionTypeDisposeSample = "DISPOSE_SAMPLE";
export const TestResultActionTypeCheckOutSample = "CHECK_OUT_SAMPLE";
export const TestResultActionTypeArchiveSample = "ARCHIVE_SAMPLE";
export const TestResultActionTypeUseExistingSample = "USE_EXISTING_SAMPLE";
export const TestRequestActionTypes = [
  TestRequestActionTypeRequestApprove,
  TestRequestActionTypeSampleRelease,
  TestResultActionTypeResultApprove,
  TestResultActionTypeDisposeSample,
  TestResultActionTypeCheckOutSample,
  TestResultActionTypeArchiveSample,
  TestResultActionTypeUseExistingSample,
] as const;
export type TestRequestActionType = (typeof TestRequestActionTypes)[number];

export interface TestRequestAction {
  actionType?: string;
  action?: ApprovalActionType;
  remarks?: string;
  records?: Array<string>;
  uuid?: string;
  testRequestUuid?: string;
  actionDate?: Date | string;
  responsiblePersonUuid?: string;
  parameters?: { [key: string]: any };
}
