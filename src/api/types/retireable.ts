import { User } from "./user";
import { OpenmrsObject } from "./openmrs-object";

export interface Retireable extends OpenmrsObject {
  retired: boolean;
  dateRetired: Date;
  retiredBy: User;
  retireReason: string;
}
