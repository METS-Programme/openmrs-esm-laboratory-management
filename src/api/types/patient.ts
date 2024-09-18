import { Person } from "./person";

export interface Patient {
  uuid?: string;
  display?: string;
  voided?: boolean;
  person?: Person;
}
