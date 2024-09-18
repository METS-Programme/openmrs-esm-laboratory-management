import React from "react";
import { useTranslation } from "react-i18next";
import SummaryTile from "../summary-tiles/summary-tile.component";
import { DashboardMetrics } from "../api/types/dashboard-metrics";

const ApprovedTileComponent = ({
  dashboardMetrics,
}: {
  dashboardMetrics: DashboardMetrics;
}) => {
  const { t } = useTranslation();
  return (
    <SummaryTile
      label={t("pending", "Pending")}
      value={dashboardMetrics?.testsPendingApproval ?? 0}
      headerLabel={t("approvals", "Approvals")}
      additionalKpis={[
        {
          label: t("completed", "Completed"),
          value: dashboardMetrics?.testsCompleted ?? 0,
        },
      ]}
    />
  );
};

export default ApprovedTileComponent;
