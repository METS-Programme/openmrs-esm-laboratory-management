import React from "react";
import { Button } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { launchOverlay } from "../../components/overlay/hook";
import ApprovalConfigForm from "./approval-config-form.component";
import { ApprovalConfig } from "../../api/types/approval-config";

interface EditApprovalConfigButtonProps {
  data: ApprovalConfig;
  className?: string;
}

const EditApprovalConfigButton: React.FC<EditApprovalConfigButtonProps> = ({
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
          t("laboratoryApprovalConfigEdit", "Edit Approval"),
          <ApprovalConfigForm model={data} />
        );
      }}
      iconDescription={t("laboratoryApprovalConfigEdit", "Edit Approval")}
    >
      {data?.approvalTitle}
    </Button>
  );
};
export default EditApprovalConfigButton;
