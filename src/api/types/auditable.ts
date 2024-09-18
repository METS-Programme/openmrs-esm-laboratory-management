import { OpenmrsObject } from "./openmrs-object";
import { User } from "./user";

export interface Auditable extends OpenmrsObject {
  creator: User;
  dateCreated: Date;
  changedBy: User;
  dateChanged: Date;
}
