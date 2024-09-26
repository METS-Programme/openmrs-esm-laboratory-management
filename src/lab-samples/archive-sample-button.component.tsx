import React, { useState } from "react";
import { Button, InlineLoading } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { closeOverlay, launchOverlay } from "../components/overlay/hook";
import { Sample } from "../api/types/sample";
import StorageActionDialog from "./dialog/storage-action-dialog.component";
import {
  TestRequestAction,
  TestResultActionTypeArchiveSample,
} from "../api/types/test-request";
import { applyTestRequestAction } from "../api/test-request.resource";
import { handleMutate } from "../api/swr-revalidation";
import { URL_API_SAMPLE } from "../config/urls";
import { getSampleActivity } from "../api/sample-activity.resource";
import { FetchResponse } from "@openmrs/esm-framework";
import { PageableResult } from "../api/types/pageable-result";
import { SampleActivity } from "../api/types/sample-activity";
import { ResourceRepresentation } from "../api/resource-filter-criteria";

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
  const [isLoadingLastActity, setIsLoadingLastActivity] = useState(false);

  const onCloseDialog = () => {
    handleMutate(URL_API_SAMPLE);
    closeOverlay();
  };

  const onArchiveClick = async () => {
    let defaultThawCycles: number = null;
    try {
      setIsLoadingLastActivity(true);
      let response: FetchResponse<PageableResult<SampleActivity>> =
        await getSampleActivity({
          sample: data.uuid,
          limit: 1,
          v: ResourceRepresentation.Default,
        });
      if (response?.data?.results?.length > 0) {
        defaultThawCycles = response?.data?.results[0].thawCycles;
      }
    } catch (e) {
    } finally {
      setIsLoadingLastActivity(false);
    }
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
        defaultThawCycles={defaultThawCycles}
      />
    );
  };

  return isLoadingLastActity ? (
    <>
      <InlineLoading
        iconDescription="Loading"
        description="Loading banner"
        status="active"
      />
    </>
  ) : (
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
