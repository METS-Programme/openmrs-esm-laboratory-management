import { OpenmrsObject } from "./openmrs-object";
import { Auditable } from "./auditable";
import { Voidable } from "./voidable";

export interface OpenmrsData extends OpenmrsObject, Auditable, Voidable {}
