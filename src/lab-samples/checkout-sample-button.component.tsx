import React, { useState } from "react";
import { Button } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { closeOverlay, launchOverlay } from "../components/overlay/hook";
import { Sample } from "../api/types/sample";
import StorageActionDialog from "./dialog/storage-action-dialog.component";
import {
  TestRequestAction,
  TestResultActionTypeCheckOutSample,
} from "../api/types/test-request";
import { applyTestRequestAction } from "../api/test-request.resource";
import { URL_API_SAMPLE } from "../config/urls";
import { handleMutate } from "../api/swr-revalidation";
import { getSampleActivity } from "../api/sample-activity.resource";
import { FetchResponse } from "@openmrs/esm-framework";
import { PageableResult } from "../api/types/pageable-result";
import { SampleActivity } from "../api/types/sample-activity";
import { ResourceRepresentation } from "../api/resource-filter-criteria";

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
  const [isLoadingLastActity, setIsLoadingLastActivity] = useState(false);

  const onCloseDialog = () => {
    handleMutate(URL_API_SAMPLE);
    closeOverlay();
  };

  const onCheckOutClick = async () => {
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
        defaultThawCycles={defaultThawCycles}
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
