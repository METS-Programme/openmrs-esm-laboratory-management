import { CareSetting } from "./care-setting";
import { Concept } from "./concept/concept";
import { Encounter } from "./encounter";
import { Link } from "./link";
import { Patient } from "./patient";

export interface Orderer {
  uuid: string;
  display: string;
  links: Link[];
}

export interface OrderType {
  uuid: string;
  display: string;
  name: string;
  javaClassName: string;
  retired: boolean;
  description: string;
  conceptClasses: any[];
  parent: any;
  links: Link[];
  resourceVersion: string;
}

export interface Order {
  uuid: string;
  orderNumber: string;
  accessionNumber: any;
  patient: Patient;
  concept: Concept;
  action: string;
  careSetting: CareSetting;
  previousOrder: any;
  dateActivated: string;
  scheduledDate: any;
  dateStopped: string;
  autoExpireDate: any;
  encounter: Encounter;
  orderer: Orderer;
  orderReason: any;
  orderReasonNonCoded: any;
  orderType: OrderType;
  urgency: string;
  instructions: string;
  commentToFulfiller: any;
  display: string;
  specimenSource: any;
  laterality: any;
  clinicalHistory: any;
  frequency: any;
  numberOfRepeats: any;
  type: string;
  resourceVersion: string;
}
