import { Sample } from "./sample";
import { UrgencyType } from "./urgency";

export interface LabRequest {
  uuid?: string | null;
  providerUuid?: string | null;
  providerName?: string | null;
  requestDate?: Date | null;
  clinicalNote?: string | null;
  patientUuid?: string | null;
  referredIn?: boolean;
  urgency?: UrgencyType | null;
  careSettingUuid?: string | null;
  careSettingName?: string | null;
  referralInExternalRef?: string | null;
  referralFromFacilityUuid?: string | null;
  referralFromFacilityName?: string | null;
  requestReason?: string | null;
  samples?: Array<Sample> | null;
}
