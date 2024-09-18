export interface RecordPermission {
  canView?: boolean;
  canEdit?: boolean;
  canApprove?: boolean | null;
  canReject?: boolean | null;
  canReleaseForTesting?: boolean | null;
  canDoSampleCollection?: boolean | null;
  canDelete?: boolean | null;
  canViewTestResults?: boolean | null;
  canEditTestResults?: boolean | null;
  canDisposeSample?: boolean | null;
  canArchiveSample?: boolean | null;
  canCheckOutSample?: boolean | null;
}
