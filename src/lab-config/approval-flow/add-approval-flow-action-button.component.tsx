import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { launchOverlay } from "../../components/overlay/hook";
import ApprovalFlowForm from "./approval-flow-form.component";
import { ApprovalFlow } from "../../api/types/approval-flow";

const AddApprovalFlowActionButton: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchOverlay(
      t("laboratoryApprovalFlowNew", "New Approval Flow"),
      <ApprovalFlowForm
        model={
          {
            levelOneAllowOwner: false,
            levelTwoAllowOwner: false,
            levelThreeAllowOwner: false,
            levelFourAllowOwner: false,
            levelTwoAllowPrevious: false,
            levelThreeAllowPrevious: false,
            levelFourAllowPrevious: false,
          } as any as ApprovalFlow
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

export default AddApprovalFlowActionButton;
