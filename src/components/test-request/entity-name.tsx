import React from "react";
import { ConfigurableLink } from "@openmrs/esm-framework";
import { TestRequest } from "../../api/types/test-request";
import { URL_PATIENT_CHART_LAB } from "../../config/urls";
import { WorksheetItem } from "../../api/types/worksheet-item";
import { Sample } from "../../api/types/sample";

export const getSampleEntityName = (sample: Sample) => {
  return sample
    ? sample?.referralFromFacilityName
      ? sample?.referralFromFacilityName
      : `${sample?.patientFamilyName ?? ""} ${
          sample?.patientMiddleName ?? ""
        } ${sample?.patientGivenName ?? ""}`
    : null;
};

export const getWorksheetItemEntityName = (worksheetItem: WorksheetItem) => {
  return worksheetItem
    ? worksheetItem?.referralFromFacilityName
      ? worksheetItem?.referralFromFacilityName
      : `${worksheetItem?.patientFamilyName ?? ""} ${
          worksheetItem?.patientMiddleName ?? ""
        } ${worksheetItem?.patientGivenName ?? ""}`
    : null;
};

export const getEntityName = (testRequest: TestRequest) => {
  return testRequest
    ? testRequest?.referralFromFacilityName
      ? testRequest?.referralFromFacilityName
      : `${testRequest?.patientFamilyName ?? ""} ${
          testRequest?.patientMiddleName ?? ""
        } ${testRequest?.patientGivenName ?? ""}`
    : null;
};

const EntityName = ({ testRequest }: { testRequest: TestRequest }) => {
  return testRequest ? (
    testRequest?.referralFromFacilityName ? (
      <>{testRequest?.referralFromFacilityName}</>
    ) : (
      <a href={URL_PATIENT_CHART_LAB(testRequest.patientUuid)} target="_blank">
        {testRequest?.patientFamilyName ?? ""}{" "}
        {testRequest?.patientMiddleName ?? ""}{" "}
        {testRequest?.patientGivenName ?? ""}
      </a>
    )
  ) : (
    <></>
  );
};

export default EntityName;
