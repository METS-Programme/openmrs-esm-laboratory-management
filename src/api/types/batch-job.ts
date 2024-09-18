import { RecordPermission } from "./record-permission";

export interface BatchJobOwner {
  uuid?: string;
  batchJobUuid?: string;
  ownerUserUuid?: string;
  ownerGivenName?: string;
  ownerFamilyName?: string;
  dateCreated?: Date;
}

export interface BatchJob {
  uuid?: string;
  batchJobType?: string;
  status?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  expiration?: Date;
  parameters?: string;
  privilegeScope?: string;
  locationScope?: string;
  locationScopeUuid?: string;
  executionState?: string;
  cancelReason?: string;
  cancelledByUuid?: string;
  cancelledByGivenName?: string;
  cancelledByFamilyName?: string;
  cancelledDate?: Date;
  exitMessage?: string;
  completedDate?: Date;
  dateCreated?: Date;
  creatorUuid?: string;
  creatorGivenName?: string;
  creatorFamilyName?: string;
  voided?: boolean;
  outputArtifactSize?: number;
  outputArtifactFileExt?: string;
  outputArtifactViewable?: boolean;
  owners?: BatchJobOwner[];
  permission?: RecordPermission | null | undefined;
}

export const BatchJobTypeReport = "Report";
export const BatchJobTypeMigration = "Migration";
export const BatchJobTypeOther = "Other";

export const BatchJobTypes = [
  BatchJobTypeReport,
  BatchJobTypeMigration,
  BatchJobTypeOther,
] as const;
export type BatchJobType = (typeof BatchJobTypes)[number];

export const BatchJobStatusPending = "Pending";
export const BatchJobStatusRunning = "Running";
export const BatchJobStatusFailed = "Failed";
export const BatchJobStatusCompleted = "Completed";
export const BatchJobStatusCancelled = "Cancelled";
export const BatchJobStatusExpired = "Expired";

export const BatchJobStatuses = [
  BatchJobStatusPending,
  BatchJobStatusRunning,
  BatchJobStatusFailed,
  BatchJobStatusCompleted,
  BatchJobStatusCancelled,
  BatchJobStatusExpired,
] as const;
export type BatchJobStatus = (typeof BatchJobStatuses)[number];

export const isBatchJobStillActive = (
  status: string | undefined | null
): boolean =>
  status === BatchJobStatusPending || status === BatchJobStatusRunning;

export const parseParametersToMap = (
  parameters: string | undefined | null,
  ignoreLines: string[] = []
): { [key: string]: { [key: string]: string } } | null => {
  if (!parameters) {
    return null;
  }

  let result: { [key: string]: { [key: string]: string } } = {};

  try {
    result = { ...result, ...(JSON.parse(parameters) ?? {}) };
  } catch (e) {}
  ignoreLines.forEach((p) => {
    if (result[p]) {
      delete result[p];
    }
  });
  return result;
};
