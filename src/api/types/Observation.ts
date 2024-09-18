import { Concept } from "./concept/concept";
import { Encounter } from "./encounter";
import { Order } from "./order";
import { Person } from "./person";

export interface Observation {
  uuid: string;
  concept: Concept;
  display: string;
  groupMembers: null | Array<Observation>;
  value:
    | {
        uuid: string;
        display: string;
      }
    | string
    | any;
  obsDatetime: string;
  order: Order;
  person: Person;
  accessionNumber: any;
  obsGroup: any;
  valueCodedName: any;
  comment: any;
  location: Location;
  encounter: Encounter;
  voided: boolean;
  valueModifier: any;
  formFieldPath: string;
  formFieldNamespace: string;
  resourceVersion: string;
}
