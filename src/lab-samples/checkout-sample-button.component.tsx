import React from "react";
import { Button } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { closeOverlay, launchOverlay } from "../components/overlay/hook";
import { Sample } from "../api/types/sample";
import StorageActionDialog from "./dialog/storage-action-dialog.component";
import {
  TestRequestAction,
  TestRequestActionTypeSampleRelease,
  TestResultActionTypeCheckOutSample,
} from "../api/types/test-request";
import { applyTestRequestAction } from "../api/test-request.resource";
import { URL_API_SAMPLE } from "../config/urls";
import { handleMutate } from "../api/swr-revalidation";

interface CheckOutSampleButtonProps {
  data: Sample;
  className?: string;
}

const CheckOutSampleButton: React.FC<CheckOutSampleButtonProps> = ({
  data,
  className,
}) => {
  const { t } = useTranslation();
  const onCheckOut = (
    testRequestAction: TestRequestAction
  ): Promise<object> => {
    testRequestAction.actionType = TestResultActionTypeCheckOutSample;
    testRequestAction.records = [data.uuid];
    return applyTestRequestAction(testRequestAction);
  };

  const onCloseDialog = () => {
    handleMutate(URL_API_SAMPLE);
    closeOverlay();
  };

  const onCheckOutClick = () => {
    launchOverlay(
      `${t("laboratoryCheckOutSample", "Check-Out Sample")}`,
      <StorageActionDialog
        closeModal={onCloseDialog}
        actionTitle={`${t("laboratoryCheckOutSample", "Check-Out Sample")}: ${
          data?.accessionNumber
        }`}
        sample={data}
        storageUnitRequired={false}
        remarksRequired={false}
        remarksTextLabel={t("laboratoryApproveRemarks", "Remarks")}
        actionButtonLabel={t("laboratoryCheckOut", "Check-Out")}
        onSaveCallback={onCheckOut}
        successMessageTitle={`${t(
          "laboratoryCheckOutSample",
          "Check-Out Sample"
        )}: ${data?.accessionNumber}`}
        successMessageBody={t(
          "laboratoryCheckOutSampleSuccess",
          "Sample Checked-Out successfully"
        )}
        approvalDescription={""}
        readonlyStorage={true}
      />
    );
  };

  return (
    <Button
      className={className}
      kind="ghost"
      size="md"
      onClick={onCheckOutClick}
      iconDescription={t("laboratoryCheckOutSample", "Check-Out Sample")}
    >
      {t("laboratoryCheckOut", "Check-Out")}
    </Button>
  );
};
export default CheckOutSampleButton;
