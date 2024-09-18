import React from "react";
import { Button } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { launchOverlay } from "../../components/overlay/hook";
import StorageForm from "./storage-form.component";
import { Storage } from "../../api/types/storage";

interface EditStorageButtonProps {
  data: Storage;
  className?: string;
}

const EditStorageButton: React.FC<EditStorageButtonProps> = ({
  data,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <Button
      className={className}
      kind="ghost"
      size="md"
      onClick={() => {
        launchOverlay(
          t("laboratoryStorageEdit", "Edit Storage"),
          <StorageForm model={data} />
        );
      }}
      iconDescription={t("laboratoryStorageEdit", "Edit Storage")}
    >
      {data?.name}
    </Button>
  );
};
export default EditStorageButton;
