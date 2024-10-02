import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { showModal } from "@openmrs/esm-framework";
import { TrashCan } from "@carbon/react/icons";
import { URL_API_STORAGE } from "../../config/urls";
import { handleMutate } from "../../api/swr-revalidation";
import { deleteStorage } from "../../api/storage.resource";

const DeleteStorageActionButton: React.FC<{
  storageName: string;
  storageUuid: string;
}> = ({ storageName, storageUuid }) => {
  const { t } = useTranslation();

  const onRejectionConfirmation = useCallback(
    (remarks: string) => {
      return deleteStorage(storageUuid, "N/A");
    },
    [storageUuid]
  );

  const handleDeleteLaboratoryOpenmrsLocation = useCallback(() => {
    const dispose = showModal("lab-approve-test-request-dialog", {
      closeModal: (success: boolean) => {
        if (success) {
          handleMutate(URL_API_STORAGE);
        }
        dispose();
      },
      hideRemarks: true,
      approvalTitle: t("laboratoryStorageDelete", "Delete Storage"),
      approvalDescription: (
        <div style={{ width: "100%" }}>
          {t(
            "laboratoryStorageDeleteConfirmText",
            `Are you sure you want to delete `
          ) +
            " " +
            storageName}
        </div>
      ),
      actionButtonLabel: t("delete", "Delete"),
      remarksRequired: false,
      approveCallback: onRejectionConfirmation,
      kind: "danger",
      successMessageTitle: t("laboratoryStorageDelete", "Delete Storage"),
      successMessageBody: t(
        "laboratoryStorageDeleteSuccess",
        "Storage deleted successfully"
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Button
      kind="danger--ghost"
      size="md"
      onClick={handleDeleteLaboratoryOpenmrsLocation}
      iconDescription={t("deleteLaboratoryStorage", "Delete Storage")}
      renderIcon={(props) => <TrashCan size={16} {...props} />}
    ></Button>
  );
};

export default DeleteStorageActionButton;
