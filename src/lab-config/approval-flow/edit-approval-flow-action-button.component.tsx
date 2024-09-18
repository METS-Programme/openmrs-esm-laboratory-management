import React from "react";
import { Button } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { launchOverlay } from "../../components/overlay/hook";
import ApprovalFlowForm from "./approval-flow-form.component";
import { ApprovalFlow } from "../../api/types/approval-flow";

interface EditApprovalFlowButtonProps {
  data: ApprovalFlow;
  className?: string;
}

const EditApprovalFlowButton: React.FC<EditApprovalFlowButtonProps> = ({
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
          t("laboratoryApprovalFlowEdit", "Edit Approval Flow"),
          <ApprovalFlowForm model={data} />
        );
      }}
      iconDescription={t("laboratoryApprovalFlowEdit", "Edit Approval Flow")}
    >
      {data?.name}
    </Button>
  );
};
export default EditApprovalFlowButton;
