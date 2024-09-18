import React, { useMemo } from "react";
import { ConfigurableLink } from "@openmrs/esm-framework";
import { BrowserRouter, useLocation } from "react-router-dom";
import { MODULE_BASE_URL } from "../config/urls";

export interface DashboardLinkConfig {
  name: string;
  title: string;
  slot?: string;
}

function DashboardExtension({
  dashboardLinkConfig,
}: {
  dashboardLinkConfig: DashboardLinkConfig;
}) {
  const { name, title } = dashboardLinkConfig;
  const location = useLocation();

  return (
    <ConfigurableLink to={MODULE_BASE_URL} className={`cds--side-nav__link`}>
      {title}
    </ConfigurableLink>
  );
}

export const createHomeDashboardLink =
  (dashboardLinkConfig: DashboardLinkConfig) => () =>
    (
      <BrowserRouter>
        <DashboardExtension dashboardLinkConfig={dashboardLinkConfig} />
      </BrowserRouter>
    );
