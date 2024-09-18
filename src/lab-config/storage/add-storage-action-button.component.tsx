import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { launchOverlay } from "../../components/overlay/hook";
import StorageForm from "./storage-form.component";
import { Storage } from "../../api/types/storage";

const AddStorageActionButton: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchOverlay(
      t("laboratoryStorageNew", "New Storage"),
      <StorageForm
        model={
          {
            active: true,
            capacity: null,
          } as any as Storage
        }
      />
    );
  }, [t]);

  return (
    <Button onClick={handleClick} size="md" kind="primary">
      {t("addNew", "Add New")}
    </Button>
  );
};

export default AddStorageActionButton;
