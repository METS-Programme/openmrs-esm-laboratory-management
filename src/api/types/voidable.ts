import { User } from "./user";
import { OpenmrsObject } from "./openmrs-object";

export interface Voidable extends OpenmrsObject {
  dateVoided: Date;
  voidedBy: User;
  voidReason: string;
  voided: boolean;
}
