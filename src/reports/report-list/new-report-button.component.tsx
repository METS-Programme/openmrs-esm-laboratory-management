import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import CreateReport from "../generate-report/create-lab-report.component";
import { launchOverlay } from "../../components/overlay/hook";

const NewReportActionButton: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchOverlay("New Report", <CreateReport />);
  }, []);

  return (
    <Button onClick={handleClick} size="md" kind="primary">
      {t("laboratoryNewReport", "New Report")}
    </Button>
  );
};

export default NewReportActionButton;
