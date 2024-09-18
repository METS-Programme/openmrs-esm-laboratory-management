import { BaseOpenmrsObject } from "../base-openmrs-object";
import { Concept } from "./concept";

export interface ConceptName extends BaseOpenmrsObject {
  conceptNameId: number;
  concept: Concept;
  name: string;
  localePreferred: boolean;
  short: boolean;
  preferred: boolean;
  indexTerm: boolean;
  synonym: boolean;
  fullySpecifiedName: boolean;
  display: string;
}
