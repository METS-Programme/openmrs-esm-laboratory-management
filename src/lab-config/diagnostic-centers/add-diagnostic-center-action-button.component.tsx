import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { URL_LOCATIONS_NEW } from "../../config/urls";

const AddApprovalFlowActionButton: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    window.open(URL_LOCATIONS_NEW(), "_blank");
  }, []);

  return (
    <Button onClick={handleClick} size="md" kind="primary">
      {t("addNew", "Add New")}
    </Button>
  );
};

export default AddApprovalFlowActionButton;
