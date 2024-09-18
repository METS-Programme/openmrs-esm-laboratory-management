import React, { useCallback } from "react";
import { SubtractAlt, TrashCan } from "@carbon/react/icons";

import { Button } from "@carbon/react";
import { showModal } from "@openmrs/esm-framework";
import {
  TestRequest,
  TestRequestActionTypeRequestApprove,
} from "../api/types/test-request";
import { TestRequestItem } from "../api/types/test-request-item";
import { formatTestName } from "../components/test-name";
import { useTranslation } from "react-i18next";
import { applyTestRequestAction } from "../api/test-request.resource";
import { ApprovalActionRejected } from "../api/types/approval-action";
import { URL_API_TEST_REQUEST } from "../config/urls";
import { handleMutate } from "../api/swr-revalidation";

export interface RejectTestItemButtonProps {
  className?: string;
  testRequest: TestRequest;
  testRequestItem: TestRequestItem;
}

const RejectTestItemButton: React.FC<RejectTestItemButtonProps> = ({
  className,
  testRequest,
  testRequestItem,
}) => {
  const { t } = useTranslation();

  const onRejectionConfirmation = useCallback(
    (remarks: string) => {
      return applyTestRequestAction({
        actionType: TestRequestActionTypeRequestApprove,
        action: ApprovalActionRejected,
        remarks: remarks,
        records: [testRequestItem.uuid],
      });
    },
    [testRequestItem.uuid]
  );

  const handleRejectTestRequests = useCallback(() => {
    const dispose = showModal("lab-approve-test-request-dialog", {
      closeModal: (success: boolean) => {
        if (success) {
          handleMutate(URL_API_TEST_REQUEST);
        }
        dispose();
      },
      approvalTitle: t("laboratoryTestRequestCancelTests", "Reject Tests"),
      approvalDescription: (
        <div className="laboratory-test-request-approve-item">
          <p>
            {testRequest.requestNo}: {testRequest.patientFamilyName}{" "}
            {testRequest.patientMiddleName} {testRequest.patientGivenName}
          </p>
          <ul>
            <li>
              {testRequestItem.orderNumber} -{" "}
              {formatTestName(
                testRequestItem.testName,
                testRequestItem.testShortName
              )}
            </li>
          </ul>
        </div>
      ),
      remarksTextLabel: t(
        "laboratoryApproveRejectReason",
        "Reason for rejection"
      ),
      actionButtonLabel: t("reject", "Reject"),
      remarksRequired: true,
      approveCallback: onRejectionConfirmation,
      kind: "danger",
      successMessageTitle: t(
        "laboratoryTestRequestCancelTests",
        "Cancel Tests"
      ),
      successMessageBody: t(
        "laboratoryTestRequestCanceTestsSuccess",
        "Tests cancelled successfully"
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Button
      className={className}
      kind="danger--ghost"
      onClick={handleRejectTestRequests}
      renderIcon={(props) => <TrashCan size={16} {...props} />}
    />
  );
};

export default RejectTestItemButton;
