import { RadioOption } from "./radio-option";
import { RecordPermission } from "./record-permission";

export interface ReferrerLocation {
  uuid: string | null | undefined;
  referrerIn: boolean | null | undefined;
  referrerOut: boolean | null | undefined;
  name: string | null | undefined;
  acronym: string | null | undefined;
  enabled: boolean | null | undefined;
  conceptUuid: string | null | undefined;
  conceptName: string | null | undefined;
  patientUuid: string | null | undefined;
  patientGivenName: string | null | undefined;
  patientMiddleName: string | null | undefined;
  patientFamilyName: string | null | undefined;
  system: boolean | null | undefined;
  permission: RecordPermission;
}

export const enabledOptions: RadioOption[] = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];
