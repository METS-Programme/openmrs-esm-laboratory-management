import { ApprovalActionType } from "./approval-action";

export interface TestApproval {
  uuid: string;
  approvedByUuid?: string;
  approvedByGivenName?: string;
  approvedByMiddleName?: string;
  approvedByFamilyName?: string;
  testResultUuid: string;
  approvalTitle: string;
  approvalResult: ApprovalActionType;
  remarks: string;
  activatedDate: Date | null;
  approvalDate: Date | null;
  currentApprovalLevel?: number;
}
