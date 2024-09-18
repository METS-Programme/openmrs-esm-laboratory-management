import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { showModal } from "@openmrs/esm-framework";
import { TrashCan } from "@carbon/react/icons";
import { URL_API_LOCATION } from "../../config/urls";
import { handleMutate } from "../../api/swr-revalidation";
import { deleteLabLocation } from "../../api/location.resource";

const DeleteDiagnosticCenterActionButton: React.FC<{
  locationName: string;
  locationUuid: string;
}> = ({ locationName, locationUuid }) => {
  const { t } = useTranslation();

  const onRejectionConfirmation = useCallback(
    (remarks: string) => {
      return deleteLabLocation(locationUuid, "N/A");
    },
    [locationUuid]
  );

  const handleDeleteLaboratoryOpenmrsLocation = useCallback(() => {
    const dispose = showModal("lab-approve-test-request-dialog", {
      closeModal: (success: boolean) => {
        if (success) {
          handleMutate(URL_API_LOCATION);
        }
        dispose();
      },
      hideRemarks: true,
      approvalTitle: t(
        "laboratoryDiagnosticCenterDelete",
        "Delete Lab Section"
      ),
      approvalDescription: (
        <div style={{ width: "100%" }}>
          {t(
            "laboratoryDiagnosticCenterDeleteConfirmText",
            `Are you sure you want to delete {{locationName}}`,
            { locationName: locationName }
          )}
        </div>
      ),
      actionButtonLabel: t("delete", "Delete"),
      remarksRequired: false,
      approveCallback: onRejectionConfirmation,
      kind: "danger",
      successMessageTitle: t(
        "laboratoryDiagnosticCenterDelete",
        "Delete Lab Section"
      ),
      successMessageBody: t(
        "laboratoryDiagnosticCenterDeleteSuccess",
        "Lab Section deleted successfully"
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Button
      kind="danger--ghost"
      size="md"
      onClick={handleDeleteLaboratoryOpenmrsLocation}
      iconDescription={t(
        "deleteLaboratoryDiagnosticCenter",
        "Delete Lab Section"
      )}
      renderIcon={(props) => <TrashCan size={16} {...props} />}
    ></Button>
  );
};

export default DeleteDiagnosticCenterActionButton;
