import React from "react";
import { Tile } from "@carbon/react";
import { TestRequest } from "../../api/types/test-request";
import styles from "./text-request-info.component.scss";
import {
  formatDateForDisplay,
  formatDateTimeForDisplay,
} from "../../utils/date-utils";
import { useTranslation } from "react-i18next";

export interface ITestRequestInfo {
  testRequest: TestRequest;
}

const TestRequestInfo: React.FC<ITestRequestInfo> = ({
  testRequest: entry,
}) => {
  const { t } = useTranslation();
  return (
    <Tile className={styles.expandedRowAdditionInfo}>
      <div className={styles.expandedRowAdditionInfoTileField}>
        <p className={styles.productiveHeading01}>
          {t("laboratoryTestRequestDate", "Request Date")}:
        </p>
        <ul>
          <li>{formatDateForDisplay(entry.requestDate)}</li>
        </ul>
      </div>
      {entry.referralFromFacilityName && (
        <div className={styles.expandedRowAdditionInfoTileField}>
          <p className={styles.productiveHeading01}>
            {t("laboratoryReferralFacility", "Referral Facility")}:
          </p>
          <ul>
            <li>{entry.referralFromFacilityName}</li>
          </ul>
        </div>
      )}
      {entry.referralInExternalRef && (
        <div className={styles.expandedRowAdditionInfoTileField}>
          <p className={styles.productiveHeading01}>
            {t(
              "laboratoryReferralReferenceNumber:",
              "Referral Reference Number"
            )}
            :
          </p>
          <ul>
            <li>{entry.referralInExternalRef}</li>
          </ul>
        </div>
      )}
      {entry.careSettingName && (
        <div className={styles.expandedRowAdditionInfoTileField}>
          <p className={styles.productiveHeading01}>
            {t("caresetting", "Care Setting")}:
          </p>
          <ul>
            <li>{entry.careSettingName}</li>
          </ul>
        </div>
      )}

      <div className={styles.expandedRowAdditionInfoTileField}>
        <p className={styles.productiveHeading01}>
          {t("submittedby", "Submitted By")}:
        </p>
        <ul>
          <li>
            {entry.creatorFamilyName} {entry.creatorGivenName}
            {entry.atLocationName ? `, ${entry.atLocationName}` : ""}
          </li>
          <li>{formatDateTimeForDisplay(entry.dateCreated)}</li>
        </ul>
      </div>
      <div
        className={`${styles.expandedRowAdditionInfoTileField} ${styles.expandedRowAdditionInfoTileFieldFillRow}`}
      >
        <p className={styles.productiveHeading01}>
          {t("laboratoryTestClinicalNote", "Clinical Note")}:
        </p>
        <ul>
          <li>{entry.clinicalNote ?? "N/A"}</li>
        </ul>
      </div>
      {entry.requestReason && (
        <div
          className={`${styles.expandedRowAdditionInfoTileField} ${styles.expandedRowAdditionInfoTileFieldFillRow}`}
        >
          <p className={styles.productiveHeading01}>
            {t("laboratoryTestRequestReason", "Request Reason")}:
          </p>
          <ul>
            <li>{entry.requestReason ?? "N/A"}</li>
          </ul>
        </div>
      )}
    </Tile>
  );
};

export default TestRequestInfo;
