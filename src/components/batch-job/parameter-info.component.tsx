import React from "react";
import { Tile } from "@carbon/react";
import styles from "./parameter-info.component.scss";
import {
  formatDateForDisplay,
  formatDateTimeForDisplay,
} from "../../utils/date-utils";
import { useTranslation } from "react-i18next";
import { BatchJob, BatchJobStatusCancelled } from "../../api/types/batch-job";

export interface IBatchJobParameterInfo {
  batchJob: BatchJob;
  executionState: React.ReactNode;
}

const BatchJobParameterInfo: React.FC<IBatchJobParameterInfo> = ({
  batchJob: batchJob,
  executionState,
}) => {
  const { t } = useTranslation();
  return (
    <Tile className={styles.expandedRowAdditionInfo}>
      {batchJob?.status === BatchJobStatusCancelled && (
        <div className={styles.expandedRowAdditionInfoTileField}>
          <p className={styles.productiveHeading01}>
            {t("Cancelled", "Cancelled")}
          </p>
          <ul>
            <li>{formatDateTimeForDisplay(batchJob?.cancelledDate)} </li>
            <li>
              {" "}
              {t("by", "By")} {batchJob.cancelledByFamilyName ?? ""}{" "}
              {batchJob.cancelledByGivenName ?? ""}
            </li>
            <li>{batchJob.cancelReason}</li>
          </ul>
        </div>
      )}
      {batchJob?.startTime && (
        <div className={styles.expandedRowAdditionInfoTileField}>
          <p className={styles.productiveHeading01}>
            {t("labManagementReportStarted", "Started")}
          </p>
          <ul>
            <li> {formatDateTimeForDisplay(batchJob?.startTime)}</li>
          </ul>
        </div>
      )}
      {batchJob?.endTime && (
        <div className={styles.expandedRowAdditionInfoTileField}>
          <p className={styles.productiveHeading01}>
            {t("labManagementReportEnded", "Finished")}
          </p>
          <ul>
            <li>{formatDateTimeForDisplay(batchJob?.endTime)}</li>
          </ul>
        </div>
      )}
      {batchJob?.expiration && (
        <div className={styles.expandedRowAdditionInfoTileField}>
          <p className={styles.productiveHeading01}>
            {t("labManagementReportExpires", "Expires")}
          </p>
          <ul>
            <li> {formatDateTimeForDisplay(batchJob?.expiration)}</li>
          </ul>
        </div>
      )}
      {executionState && (
        <div className={styles.expandedRowAdditionInfoTileField}>
          <p className={styles.productiveHeading01}>
            {t("labManagementReportExecutionState", "Execution State")}
          </p>
          <ul>
            <li>{executionState}</li>
          </ul>
        </div>
      )}
      {batchJob?.completedDate && (
        <div className={styles.expandedRowAdditionInfoTileField}>
          <p className={styles.productiveHeading01}>
            {t("labManagementReportCompleted", "Completed")}
          </p>
          <ul>
            <li> {formatDateTimeForDisplay(batchJob?.completedDate)}</li>
          </ul>
        </div>
      )}
      {batchJob?.exitMessage && (
        <div className={styles.expandedRowAdditionInfoTileField}>
          <p className={styles.productiveHeading01}>
            {t("labManagementReportExitMessage", "Exit Message")}
          </p>
          <ul>
            <li> {batchJob.exitMessage}</li>
          </ul>
        </div>
      )}
    </Tile>
  );
};

export default BatchJobParameterInfo;
