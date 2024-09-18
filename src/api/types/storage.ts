import { RecordPermission } from "./record-permission";

export interface StorageUnit {
  uuid: string | null | undefined;
  unitName: string | null | undefined;
  description: string | null | undefined;
  storageUuid: string | null | undefined;
  storageName: string | null | undefined;
  atLocationUuid: string | null | undefined;
  atLocationName: string | null | undefined;
  active: boolean | null | undefined;
  capacity: number | null | undefined;
  voided: boolean;
  creator: number | null | undefined;
  creatorUuid: string | null | undefined;
  creatorGivenName: string | null | undefined;
  creatorFamilyName: string | null | undefined;
  changedByUuid: string | null | undefined;
  changedByGivenName: string | null | undefined;
  changedByFamilyName: string | null | undefined;
  changedBy: number | null | undefined;
  dateChanged: Date | null | undefined;
  dateCreated: Date | null | undefined;
  permission: RecordPermission;
}

export interface Storage {
  uuid: string | null | undefined;
  name: string | null | undefined;
  description: string | null | undefined;
  atLocationUuid: string | null | undefined;
  atLocationName: string | null | undefined;
  active: boolean | null | undefined;
  capacity: number | null | undefined;
  voided: boolean;
  creator: number | null | undefined;
  creatorUuid: string | null | undefined;
  creatorGivenName: string | null | undefined;
  creatorFamilyName: string | null | undefined;
  changedByUuid: string | null | undefined;
  changedByGivenName: string | null | undefined;
  changedByFamilyName: string | null | undefined;
  changedBy: number | null | undefined;
  dateChanged: Date | null | undefined;
  dateCreated: Date | null | undefined;
  units: Array<StorageUnit> | null | undefined;
  permission: RecordPermission;
}
