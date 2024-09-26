import React, { useEffect } from "react";
import { ILaboratoryNavigationProps } from "../header/laboratory-navigation";
import { useTranslation } from "react-i18next";
import LabReportsList from "./report-list/lab-reports-list.component";

interface LabReportsProps extends ILaboratoryNavigationProps {}

const LabReports: React.FC<LabReportsProps> = ({ onPageChanged }) => {
  const { t } = useTranslation();

  useEffect(
    () => {
      onPageChanged({
        showDateInHeader: false,
        title: t("laboratoryReport", "Reports"),
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return (
    <>
      <LabReportsList />
    </>
  );
};

export default LabReports;
