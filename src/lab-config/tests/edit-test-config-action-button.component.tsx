import React from "react";
import { Button } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { launchOverlay } from "../../components/overlay/hook";
import TestConfigForm from "./test-config-form.component";
import { TestConfig } from "../../api/types/test-config";

interface EditTestConfigButtonProps {
  data: TestConfig;
  className?: string;
}

const EditTestConfigButton: React.FC<EditTestConfigButtonProps> = ({
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
          t("laboratoryTestConfigEditTest", "Edit Test Configuration"),
          <TestConfigForm model={data} />
        );
      }}
      iconDescription={t("laboratoryTestConfigEdit", "Edit Test")}
    >
      {data?.testName ?? ""}
      {data?.testShortName ? ` (${data?.testShortName})` : ""}
    </Button>
  );
};
export default EditTestConfigButton;
