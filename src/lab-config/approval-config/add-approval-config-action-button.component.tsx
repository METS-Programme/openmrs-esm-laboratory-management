import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { launchOverlay } from "../../components/overlay/hook";
import ApprovalConfigForm from "./approval-config-form.component";
import { ApprovalConfig } from "../../api/types/approval-config";

const AddApprovalConfigActionButton: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchOverlay(
      t("laboratoryApprovalConfigNew", "New Approval"),
      <ApprovalConfigForm model={{} as any as ApprovalConfig} />
    );
  }, [t]);

  return (
    <Button onClick={handleClick} size="md" kind="primary">
      {t("addNew", "Add New")}
    </Button>
  );
};

export default AddApprovalConfigActionButton;
