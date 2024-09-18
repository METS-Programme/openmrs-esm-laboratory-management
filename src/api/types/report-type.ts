export enum ReportParameter {
  Date = "Date",
  StartDate = "StartDate",
  EndDate = "EndDate",
  Location = "Location",
  Patient = "Patient",
  ReferralLocation = "ReferralLocation",
  Limit = "Limit",
  DiagnosticLocation = "DiagnosticLocation",
  TestType = "TestType",
  TestOutcome = "TestOutcome",
  Tester = "Tester",
  TestApprover = "TestApprover",
  ReferenceNumber = "ReferenceNumber",
}

export const getParamDefaultLimit = (
  reportSystemName: string | undefined | null
) => {
  return reportSystemName ? 20 : null;
};

export const isAuditTrailReport = (
  reportSystemName: string | undefined | null
) => {
  return reportSystemName === "AUDIT_TRAIL_REPORT";
};

export const getReportLimitLabel = (
  reportSystemName: string | undefined | null
) => {
  return "labmanagement.report.edit.limit";
};

export const getReportStartDateLabel = (
  reportSystemName: string | undefined | null
) => {
  return "Start Date";
};

export const getReportEndDateLabel = (
  reportSystemName: string | undefined | null
) => {
  return "End Date";
};

export const getTesterLabel = (
  reportSystemName: string | undefined | null,
  translator: (key: string, defaultValue: string) => string
) => {
  return isAuditTrailReport(reportSystemName)
    ? translator("laboratoryReportUser", "User")
    : translator("laboratoryReportTester", "Tester");
};

export interface ReportType {
  order: number;
  name: string;
  uuid: string;
  systemName: string;
  parameters: ReportParameter[];
}
