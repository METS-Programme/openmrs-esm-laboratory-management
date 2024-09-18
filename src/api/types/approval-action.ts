export const ApprovalActionApproved = "APPROVED";
export const ApprovalActionRejected = "REJECTED";
export const ApprovalActionReturned = "RETURNED";
export const ApprovalResultNotRequired = "NOT_REQUIRED";
export const ApprovalActions = [
  ApprovalActionApproved,
  ApprovalActionRejected,
  ApprovalActionReturned,
  ApprovalResultNotRequired,
] as const;
export type ApprovalActionType = (typeof ApprovalActions)[number];
