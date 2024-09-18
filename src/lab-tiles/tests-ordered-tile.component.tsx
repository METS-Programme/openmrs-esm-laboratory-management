import React from "react";
import { useTranslation } from "react-i18next";
import SummaryTile from "../summary-tiles/summary-tile.component";
import { DashboardMetrics } from "../api/types/dashboard-metrics";

const TestsOrderedTileComponent = ({
  dashboardMetrics,
}: {
  dashboardMetrics: DashboardMetrics;
}) => {
  const { t } = useTranslation();

  return (
    <SummaryTile
      label={t("acceptTests", "Accept Tests")}
      value={dashboardMetrics?.testsToAccept ?? 0}
      headerLabel={t("testsOrdered", "Tests ordered")}
      additionalKpis={[
        {
          value: dashboardMetrics?.testsForSampleCollection ?? 0,
          label: t("collection", "Collection"),
        },
      ]}
    />
  );
};

export default TestsOrderedTileComponent;
