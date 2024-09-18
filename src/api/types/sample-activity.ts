export interface SampleActivity {
  uuid: string;
  sampleUuid: string;
  activityType: string;
  sourceUuid: string;
  sourceName: string;
  destinationUuid: string;
  destinationName: string;
  sourceState: string;
  destinationState: string;
  activityByUuid: string;
  activityByGivenName: string;
  activityByMiddleName: string;
  activityByFamilyName: string;

  remarks: string;
  status: string;
  volume: number;
  volumeUnit: number;
  volumeUnitUuid: string;
  volumeUnitName: string;
  thawCycles: number;
  storageUnitUuid: string;
  storageUnitName: string;
  storageUuid: string;
  storageName: string;
  activityDate: Date;

  responsiblePersonUuid: string;
  responsiblePersonGivenName: string;
  responsiblePersonMiddleName: string;
  responsiblePersonFamilyName: string;
  responsiblePersonOther: string;

  creatorUuid: string;
  creatorGivenName: string;
  creatorMiddleName: string;
  creatorFamilyName: string;
  dateCreated: Date;
}
