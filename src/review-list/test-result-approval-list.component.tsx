import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
} from "@carbon/react";
import { isDesktop } from "@openmrs/esm-framework";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import styles from "../tests-ordered/laboratory-queue.scss";
import { formatDateTimeForDisplay } from "../utils/date-utils";
import { TestApproval } from "../api/types/test-approval";
import {
  ApprovalActionApproved,
  ApprovalActionRejected,
  ApprovalActionReturned,
  ApprovalResultNotRequired,
} from "../api/types/approval-action";

import {
  CheckmarkOutline,
  CheckmarkOutlineError,
  CloseOutline,
  Time,
} from "@carbon/react/icons";

interface TestResultApprovalListProps {
  approvals: Array<TestApproval>;
}

const TestResultApprovalList: React.FC<TestResultApprovalListProps> = ({
  approvals,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.listItems}>
        {(approvals?.length ?? 0) === 0 ? (
          <div className={styles.listItem}>
            {t("noLaboratoryTestApprovalsToDisplay", "No approvals to display")}
          </div>
        ) : (
          approvals.map((approval) => (
            <div key={approval.uuid} className={styles.listItem}>
              <div
                className={`${styles.avatar} ${
                  approval.approvalResult == ApprovalActionApproved
                    ? styles.avatarSuccess
                    : approval.approvalResult == ApprovalResultNotRequired
                    ? styles.avatarNoApproval
                    : approval.approvalResult == ApprovalActionRejected ||
                      approval.approvalResult == ApprovalActionReturned
                    ? styles.avatarDanger
                    : styles.avatarPending
                }`}
              >
                {approval.approvalResult == ApprovalActionApproved ? (
                  <CheckmarkOutline />
                ) : approval.approvalResult == ApprovalResultNotRequired ? (
                  <CheckmarkOutlineError />
                ) : approval.approvalResult == ApprovalActionRejected ||
                  approval.approvalResult == ApprovalActionReturned ? (
                  <CloseOutline />
                ) : (
                  <Time />
                )}
              </div>
              <div className={styles.approvalInfo}>
                <div className={styles.approvalTitle}>
                  <h6 className={styles.productiveHeading01}>
                    {approval.approvalTitle}
                  </h6>
                  <span>{"-"}</span>
                  <span>
                    {formatDateTimeForDisplay(approval.activatedDate)}
                  </span>
                </div>
                {approval.approvalResult ? (
                  <div className={styles.approvalContent}>
                    {t(approval.approvalResult)} {t("by", "By")}{" "}
                    {(approval.approvedByFamilyName ||
                      approval.approvedByMiddleName ||
                      approval.approvedByGivenName) && (
                      <>
                        <strong className={styles.italic}>
                          {" "}
                          {approval.approvedByFamilyName ?? ""}{" "}
                          {approval.approvedByMiddleName ?? ""}{" "}
                          {approval.approvedByGivenName ?? ""}
                        </strong>
                        {" On "}
                        <strong className={styles.italic}>
                          {formatDateTimeForDisplay(approval.approvalDate)}
                        </strong>
                        {approval?.remarks && (
                          <div className={styles.approvalRemarks}>
                            {approval.remarks}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    {t(
                      "laboratoryTestApprovalPendingApproval",
                      "Pending Approval"
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default TestResultApprovalList;
