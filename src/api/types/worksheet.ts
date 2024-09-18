import { RecordPermission } from "./record-permission";
import { WorksheetItem } from "./worksheet-item";

export interface Worksheet {
  uuid?: string;
  atLocationUuid?: string;
  atLocationName?: string;
  worksheetDate?: Date;
  worksheetNo?: string;
  remarks?: string;
  testUuid?: string;
  testName?: string;
  testShortName?: string;
  diagnosisTypeUuid?: string;
  diagnosisTypeName?: string;
  status?: WorksheetStatusType;
  responsiblePersonUuid?: string;
  responsiblePersonGivenName?: string;
  responsiblePersonMiddleName?: string;
  responsiblePersonFamilyName?: string;
  responsiblePersonOther?: string;
  voided?: boolean;
  creatorUuid?: string;
  creatorGivenName?: string;
  creatorFamilyName?: string;
  dateCreated?: Date;
  changedByUuid?: string;
  changedByGivenName?: string;
  changedByFamilyName?: string;
  dateChanged?: Date;
  worksheetItems?: Array<WorksheetItem>;
  permission?: RecordPermission;
}

export const WorksheetStatusPending = "PENDING";
export const WorksheetStatusResulted = "RESULTED";
export const WorksheetStatusCancelled = "CANCELLED";

export const WorksheetStatuses = [
  WorksheetStatusPending,
  WorksheetStatusResulted,
  WorksheetStatusCancelled,
] as const;
export type WorksheetStatusType = (typeof WorksheetStatuses)[number];

export type WorksheetSelectedItemOptions = {
  [key: string]: {
    isSelected: boolean;
    testRequestItemSampleUuid: string;
  };
};
