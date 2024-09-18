import { BaseOpenmrsObject } from "../base-openmrs-object";
import { Auditable } from "../auditable";
import { Retireable } from "../retireable";
import { ConceptName } from "./conceptName";

export interface ConceptDataType {
  display?: string;
}

export interface Concept extends BaseOpenmrsObject, Auditable, Retireable {
  conceptId: number;
  display: string;
  set: boolean;
  version: string;
  names: ConceptName[];
  name: ConceptName;
  numeric: boolean;
  complex: boolean;
  shortNames: ConceptName[];
  indexTerms: ConceptName[];
  synonyms: ConceptName[];
  setMembers: Concept[];
  possibleValues: Concept[];
  preferredName: ConceptName;
  shortName: ConceptName;
  fullySpecifiedName: ConceptName;
  answers: Concept[];
  datatype?: ConceptDataType;
  hiNormal?: number;
  hiAbsolute?: number;
  hiCritical?: number;
  lowNormal?: number;
  lowAbsolute?: number;
  lowCritical?: number;
  units?: string;
  attributes: any[];
  retired: boolean;
  allowDecimal?: boolean;
  conceptClass: {
    uuid: string;
    display: string;
  };
}
export interface ConceptReference extends Concept {
  // uuid: string;
  // display: string;
  // name: Name3;
  // datatype: Datatype2;
  // conceptClass: ConceptClass2;
  // descriptions: any[];
  // mappings: Mapping2[];
  // answers: Answer[];
  // setMembers: any[];
  // links: Link15[];
  // resourceVersion: string;
}
