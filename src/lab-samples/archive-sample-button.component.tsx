import React from "react";
import { Button } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { closeOverlay, launchOverlay } from "../components/overlay/hook";
import { Sample } from "../api/types/sample";
import StorageActionDialog from "./dialog/storage-action-dialog.component";
import {
  TestRequestAction,
  TestRequestActionTypeSampleRelease,
  TestResultActionTypeArchiveSample,
} from "../api/types/test-request";
import { applyTestRequestAction } from "../api/test-request.resource";
import { sample } from "rxjs/operators";
import { handleMutate } from "../api/swr-revalidation";
import { URL_API_SAMPLE } from "../config/urls";

interface ArchiveSampleButtonProps {
  data: Sample;
  className?: string;
}

const ArchiveSampleButton: React.FC<ArchiveSampleButtonProps> = ({
  data,
  className,
}) => {
  const { t } = useTranslation();
  const onArchive = (testRequestAction: TestRequestAction): Promise<object> => {
    testRequestAction.actionType = TestResultActionTypeArchiveSample;
    testRequestAction.records = [data.uuid];
    return applyTestRequestAction(testRequestAction);
  };

  const onCloseDialog = () => {
    handleMutate(URL_API_SAMPLE);
    closeOverlay();
  };

  const onArchiveClick = () => {
    launchOverlay(
      t("laboratoryArchiveSample", "Archive Sample"),
      <StorageActionDialog
        closeModal={onCloseDialog}
        actionTitle=""
        sample={data}
        storageUnitRequired={true}
        remarksRequired={false}
        remarksTextLabel={t("laboratoryApproveRemarks", "Remarks (optional)")}
        actionButtonLabel={t("laboratoryArchive", "Archive")}
        onSaveCallback={onArchive}
        successMessageTitle={`${t(
          "laboratoryArchiveSample",
          "Archive Sample"
        )}: ${data?.accessionNumber}`}
        successMessageBody={t(
          "laboratoryArchiveSampleSuccess",
          "Sample archived successfully"
        )}
        approvalDescription={""}
      />
    );
  };

  return (
    <Button
      className={className}
      kind="ghost"
      size="md"
      onClick={onArchiveClick}
      iconDescription={t("laboratoryArchiveSample", "Archive Sample")}
    >
      {t("laboratoryArchive", "Archive")}
    </Button>
  );
};
export default ArchiveSampleButton;
