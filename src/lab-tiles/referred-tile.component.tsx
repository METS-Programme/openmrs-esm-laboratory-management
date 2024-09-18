import React from "react";
import { useTranslation } from "react-i18next";
import SummaryTile from "../summary-tiles/summary-tile.component";
import { DashboardMetrics } from "../api/types/dashboard-metrics";

const ReferredTileComponent = ({
  dashboardMetrics,
}: {
  dashboardMetrics: DashboardMetrics;
}) => {
  const { t } = useTranslation();

  return (
    <SummaryTile
      label={t("provider", "Provider")}
      value={dashboardMetrics?.testsReferredOutProvider ?? 0}
      headerLabel={t("referredTests", "Referred tests")}
      additionalKpis={[
        {
          label: t("laboratory", "Laboratory"),
          value: dashboardMetrics?.testsReferredOutLab ?? 0,
        },
        {
          label: t("resulted", "Resulted"),
          value: dashboardMetrics?.testsReferredOutLabResulted ?? 0,
        },
      ]}
    />
  );
};

export default ReferredTileComponent;
