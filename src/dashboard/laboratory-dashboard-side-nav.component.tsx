import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { SideNavItem } from "../components/side-nav/side-nav-item";
import SideNavItemsList from "../components/side-nav/side-nav.component";
import {
  BASE_OPENMRS_APP_SPA_URL,
  MODULE_BASE_URL,
  URL_LAB_OPENMRS_SETTINGS,
  URL_LAB_CONFIGURATION,
} from "../config/urls";
import {
  APP_LABMANAGEMENT_DASHBOARD,
  APP_LABMANAGEMENT_TESTCONFIGURATIONS,
  MANAGE_GLOBAL_PROPERTIES,
} from "../config/privileges";

const LaboratoryDashboardSideNav = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs: SideNavItem[] = [
    {
      name: t("home", "Home"),
      link: `${BASE_OPENMRS_APP_SPA_URL}home`,
    },
    {
      name: t("laboratory", "Laboratory"),
      link: MODULE_BASE_URL,
      privilege: APP_LABMANAGEMENT_DASHBOARD,
    },
    {
      name: t("laboratoryTestConfigurations", "Settings"),
      link: `${MODULE_BASE_URL}${URL_LAB_CONFIGURATION}`,
      privilege: APP_LABMANAGEMENT_TESTCONFIGURATIONS,
    },
    {
      name: t("laboratorySettings", "Settings"),
      link: URL_LAB_OPENMRS_SETTINGS,
      privilege: MANAGE_GLOBAL_PROPERTIES,
    },
  ];

  return (
    <SideNavItemsList
      tabs={tabs}
      selectedIndex={selectedTab}
      onSelectTab={setSelectedTab}
    />
  );
};

export default LaboratoryDashboardSideNav;
