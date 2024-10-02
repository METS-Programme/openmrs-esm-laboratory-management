import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { launchOverlay } from "../../components/overlay/hook";
import TestImport from "./test-import.component";

const AddTestConfigBulkImportActionButton: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchOverlay(
      t("laboratoryTestConfigImportTest", "Import Test Configuration"),
      <TestImport />
    );
  }, [t]);

  return (
    <Button
      kind="ghost"
      onClick={handleClick}
      iconDescription={t("import", "Import")}
    >
      {t("import", "Import")}
    </Button>
  );
};

export default AddTestConfigBulkImportActionButton;
