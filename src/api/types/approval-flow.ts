import { RadioOption } from "./radio-option";
import { RecordPermission } from "./record-permission";

export const approvalAllowOwnerOptions: RadioOption[] = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];

export interface ApprovalFlow {
  uuid: string | null | undefined;

  name: string | null | undefined;
  levelOneUuid: string | null | undefined;
  levelOneApprovalTitle: string | null | undefined;

  levelTwoUuid: string | null | undefined;
  levelTwoApprovalTitle: string | null | undefined;

  levelThreeUuid: string | null | undefined;
  levelThreeApprovalTitle: string | null | undefined;
  levelFourUuid: string | null | undefined;
  levelFourApprovalTitle: string | null | undefined;
  systemName: string | null | undefined;
  levelOneAllowOwner: boolean | null | undefined;
  levelTwoAllowOwner: boolean | null | undefined;
  levelThreeAllowOwner: boolean | null | undefined;
  levelFourAllowOwner: boolean | null | undefined;
  levelTwoAllowPrevious: boolean | null | undefined;
  levelThreeAllowPrevious: boolean | null | undefined;
  levelFourAllowPrevious: boolean | null | undefined;
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
