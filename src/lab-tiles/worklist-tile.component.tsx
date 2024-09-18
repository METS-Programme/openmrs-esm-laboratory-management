import React from "react";
import { useTranslation } from "react-i18next";
import SummaryTile from "../summary-tiles/summary-tile.component";
import { DashboardMetrics } from "../api/types/dashboard-metrics";

const WorklistTileComponent = ({
  dashboardMetrics,
}: {
  dashboardMetrics: DashboardMetrics;
}) => {
  const { t } = useTranslation();
  return (
    <SummaryTile
      label={t("inProgress", "In progress")}
      value={dashboardMetrics?.testsInProgress ?? 0}
      headerLabel={t("worklist", "Worklist")}
      additionalKpis={[
        {
          value: dashboardMetrics?.testResultsRejected ?? 0,
          label: t("rejectedResult", "Rejected Result"),
        },
      ]}
    />
  );
};

export default WorklistTileComponent;
