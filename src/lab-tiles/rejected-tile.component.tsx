import React from "react";
import { useTranslation } from "react-i18next";
import SummaryTile from "../summary-tiles/summary-tile.component";
import { DashboardMetrics } from "../api/types/dashboard-metrics";

const RejectedTileComponent = ({
  dashboardMetrics,
}: {
  dashboardMetrics: DashboardMetrics;
}) => {
  const { t } = useTranslation();
  return (
    <SummaryTile
      label={t("tests", "Tests")}
      value={dashboardMetrics?.testsRejected ?? 0}
      headerLabel={t("testsRejected", "Rejected")}
    />
  );
};

export default RejectedTileComponent;
