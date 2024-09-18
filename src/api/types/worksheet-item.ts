import { Concept } from "./concept/concept";
import { RecordPermission } from "./record-permission";
import { TestResult } from "./test-result";

export interface WorksheetItem {
  uuid?: string;
  sampleUuid?: string;
  testRequestItemSampleUuid?: string;
  sampleProvidedRef?: string;
  sampleAccessionNumber?: string;
  sampleTypeUuid?: string;
  sampleTypeName?: string;
  urgency?: string;
  patientUuid?: string;
  patientIdentifier?: string;
  patientGivenName?: string;
  patientMiddleName?: string;
  patientFamilyName?: string;
  toLocationUuid?: string;
  toLocationName?: string;
  testResultUuid?: string;
  sampleCollectionDate?: Date;
  sampleContainerTypeUuid?: string | null | undefined;
  sampleContainerTypeName?: string | null | undefined;
  sampleVolume?: number | null | undefined;
  sampleVolumeUnitUuid?: string | null | undefined;
  sampleVolumeUnitName?: string | null | undefined;
  sampleCollectedByUuid?: string | null | undefined;
  sampleCollectedByGivenName?: string;
  sampleCollectedByMiddleName?: string;
  sampleCollectedByFamilyName?: string;
  sampleContainerCount?: number | null | undefined;
  sampleExternalRef?: string;
  status?: WorksheetItemStatusType;
  completedDate?: Date;
  cancelledDate?: Date;
  cancellationRemarks?: string;
  testRequestItemUuid?: string;
  orderUuid?: string;
  testUuid?: string;
  testName?: string;
  testShortName?: string;
  creatorUuid?: string;
  creatorGivenName?: string;
  creatorFamilyName?: string;
  dateCreated?: Date;
  changedByUuid?: string;
  changedByGivenName?: string;
  changedByFamilyName?: string;
  dateChanged?: Date;
  permission?: RecordPermission;
  isNewlySelected?: boolean;
  testConcept?: Concept;
  testResult?: TestResult;
  referralFromFacilityUuid?: string;
  referralFromFacilityName?: string;
  referralInExternalRef?: string;
  testRequestNo?: string;
  orderNumber?: string;
}

export const WorksheetItemStatusPending = "PENDING";
export const WorksheetItemStatusResulted = "RESULTED";
export const WorksheetItemStatusCancelled = "CANCELLED";

export const WorksheetItemStatuses = [
  WorksheetItemStatusPending,
  WorksheetItemStatusResulted,
  //WorksheetItemStatusCancelled,
] as const;
export type WorksheetItemStatusType = (typeof WorksheetItemStatuses)[number];

export const SampleAccessionNumberTagType = "green";
export const SampleExternalReferenceTagType = "cool-gray";
export const SampleProvidedReferenceTagType = "cyan";
export const WorksheetItemStatusToTagType = (
  status: WorksheetItemStatusType
) => {
  switch (status) {
    case WorksheetItemStatusResulted:
      return "green";
    /*case WorksheetItemStatusCancelled:
      return "magenta";*/
    case WorksheetItemStatusPending:
      return "outline";
  }
  return "gray";
};
/*
red: 'Red',
  magenta: 'Magenta',
  purple: 'Purple',
  blue: 'Blue',
  cyan: 'Cyan',
  teal: 'Teal',
  green: 'Green',
  gray: 'Gray',
  'cool-gray': 'Cool-Gray',
  'warm-gray': 'Warm-Gray',
  'high-contrast': 'High-Contrast',
  outline: 'Outline'
*/
