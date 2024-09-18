import { RecordPermission } from "./record-permission";

export interface ApprovalConfig {
  uuid: string | null | undefined;
  approvalTitle: string | null | undefined;
  privilege: string | null | undefined;
  pendingStatus: string | null | undefined;
  returnedStatus: string | null | undefined;
  rejectedStatus: string | null | undefined;
  approvedStatus: string | null | undefined;
  voided: boolean;
  creator: number | null | undefined;
  creatorUuid: string | null | undefined;
  creatorGivenName: string | null | undefined;
  creatorFamilyName: string | null | undefined;
  changedByUuid: string | null | undefined;
  changedByGivenName: string | null | undefined;
  changedByFamilyName: string | null | undefined;
  changedBy: number | null | undefined;
  dateChanged: Date | null | undefined;
  dateCreated: Date | null | undefined;
  permission: RecordPermission;
}
