import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { showModal } from "@openmrs/esm-framework";
import { Sample } from "../api/types/sample";
import { TrashCan } from "@carbon/react/icons";
import { URL_API_SAMPLE, URL_API_TEST_REQUEST } from "../config/urls";
import { handleMutate } from "../api/swr-revalidation";
import { deleteSample } from "../api/sample.resource";
import { TestRequest } from "../api/types/test-request";
import { TestRequestItem } from "../api/types/test-request-item";
import { formatTestName } from "../components/test-name";

const DeleteSampleActionButton: React.FC<{
  sample: Sample;
  testRequest: TestRequest;
}> = ({ sample }) => {
  const { t } = useTranslation();

  const onRejectionConfirmation = useCallback(
    (remarks: string) => {
      return deleteSample(sample.uuid);
    },
    [sample.uuid]
  );

  const handleDeleteLaboratorySample = useCallback(() => {
    const dispose = showModal("lab-approve-test-request-dialog", {
      closeModal: (success: boolean) => {
        if (success) {
          handleMutate(URL_API_TEST_REQUEST);
          handleMutate(URL_API_SAMPLE);
        }
        dispose();
      },
      hideRemarks: true,
      approvalTitle: t("laboratorySampleDelete", "Delete Sample"),
      approvalDescription: (
        <div
          className="laboratory-test-request-approve-item"
          style={{ width: "100%" }}
        >
          <p>
            {t("sampleType", "Sample Type")}: {sample.sampleTypeName}
          </p>
          <p>
            {t("laboratorySampleReference", "Sample ID")}:
            {sample.accessionNumber}
          </p>
          {(sample?.tests as Array<TestRequestItem>)?.length > 0 ? (
            <>
              <p>{t("laboratorySampleAssociatedTests", "Associated Tests")}</p>
              <ul>
                {(sample?.tests as Array<TestRequestItem>)?.map((test) => (
                  <li>{formatTestName(test.testName, test.testShortName)}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>
              {t("laboratorySampleNoAssociatedTests", "No Associated Tests")}
            </p>
          )}
        </div>
      ),
      actionButtonLabel: t("delete", "Delete"),
      remarksRequired: false,
      approveCallback: onRejectionConfirmation,
      kind: "danger",
      successMessageTitle: t("laboratorySampleDelete", "Delete Sample"),
      successMessageBody: t(
        "laboratorySampleDeleteSuccess",
        "Sample deleted successfully"
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Button
      kind="danger--ghost"
      size="md"
      onClick={handleDeleteLaboratorySample}
      iconDescription={t("deleteLaboratorySample", "Delete Sample")}
      renderIcon={(props) => <TrashCan size={16} {...props} />}
    ></Button>
  );
};

export default DeleteSampleActionButton;
