import { OpenmrsObject } from "./openmrs-object";
import { Auditable } from "./auditable";
import { Retireable } from "./retireable";

export interface OpenmrsMetadata extends OpenmrsObject, Auditable, Retireable {
  name: string;
  description: string;
}
