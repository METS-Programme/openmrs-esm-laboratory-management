import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { launchOverlay } from "../../components/overlay/hook";
import TestConfigForm from "./test-config-form.component";
import { TestConfig } from "../../api/types/test-config";

const AddTestConfigActionButton: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchOverlay(
      t("laboratoryTestConfigNewTest", "New Test Configuration"),
      <TestConfigForm model={{} as any as TestConfig} />
    );
  }, [t]);

  return (
    <Button onClick={handleClick} size="md" kind="primary">
      {t("laboratoryTestConfigAddNew", "Add New")}
    </Button>
  );
};

export default AddTestConfigActionButton;
