import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { showModal } from "@openmrs/esm-framework";
import { TrashCan } from "@carbon/react/icons";
import { URL_API_SAMPLE, URL_API_TEST_REQUEST } from "../config/urls";
import { handleMutate } from "../api/swr-revalidation";
import { formatTestName } from "../components/test-name";
import { WorksheetItem } from "../api/types/worksheet-item";
import { deleteWorksheetItem } from "../api/worksheet-item.resource";

const DeleteWorksheetItemActionButton: React.FC<{
  worksheet: WorksheetItem;
}> = ({ worksheet }) => {
  const { t } = useTranslation();

  const onRejectionConfirmation = useCallback(
    (remarks: string) => {
      return deleteWorksheetItem(worksheet.uuid, remarks);
    },
    [worksheet.uuid]
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
      approvalTitle: t("laboratoryWorksheetSampleDelete", "Remove Item"),
      approvalDescription: (
        <div
          className="laboratory-test-request-approve-item"
          style={{ width: "100%" }}
        >
          <p>
            {t("sampleType", "Sample Type")}: {worksheet.sampleTypeName}
          </p>
          <p>
            {t("laboratoryWorksheetSampleReference", "Sample ID")}:
            {worksheet.sampleAccessionNumber}
          </p>
          <>
            <p>
              {t(
                "laboratoryWorksheetSampleAssociatedTests",
                "Associated Tests"
              )}
            </p>
            <ul>
              <li>
                {formatTestName(worksheet.testName, worksheet.testShortName)}
              </li>
            </ul>
          </>
        </div>
      ),
      actionButtonLabel: t("remove", "Remove"),
      remarksRequired: false,
      approveCallback: onRejectionConfirmation,
      kind: "danger",
      successMessageTitle: t("laboratoryWorksheetItemRemove", "Remove Item"),
      successMessageBody: t(
        "laboratoryWorksheetItemRemoveSuccess",
        "Item removed successfully"
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Button
      kind="danger--ghost"
      size="md"
      onClick={handleDeleteLaboratorySample}
      iconDescription={t("remoteLaboratoryWorksheetItem", "Remove Item")}
      renderIcon={(props) => <TrashCan size={16} {...props} />}
    ></Button>
  );
};

export default DeleteWorksheetItemActionButton;
