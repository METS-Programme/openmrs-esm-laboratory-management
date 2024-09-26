import React, { useEffect, useState } from "react";
import { ILaboratoryNavigationProps } from "../header/laboratory-navigation";
import { useTranslation } from "react-i18next";
import { Tab, Tabs, TabList, TabPanel, TabPanels } from "@carbon/react";
import styles from "./config.component.scss";
import { useSession, userHasAccess } from "@openmrs/esm-framework";
import {
  APP_LABMANAGEMENT_STORAGE,
  MANAGE_GLOBAL_PROPERTIES,
} from "../config/privileges";
import TestConfigList from "./tests/test-config-list.component";
import ApprovalFlowList from "./approval-flow/approval-flow-list.component";
import ApprovalConfigList from "./approval-config/approval-config-list.component";
import ReferrerLocationList from "./referrel-locations/referrer-location-list.component";
import DiagnosticCenterList from "./diagnostic-centers/diagnostic-center-list.component";
import StorageList from "./storage/storage-list.component";
import { URL_OPENMRS_LABMANAGEMENT_SETTINGS } from "../config/urls";

interface ConfigProps extends ILaboratoryNavigationProps {}

const Config: React.FC<ConfigProps> = ({ onPageChanged }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [canDisplayStorage, setCanDisplayStorage] = useState(false);
  const [canManageGlobalProperties, setCanManageGlobalProperties] =
    useState(false);
  const userSession = useSession();
  const { t } = useTranslation();

  useEffect(
    () => {
      onPageChanged({
        showDateInHeader: false,
        title: t("laboratoryTestConfigHeaderTitle", "Settings"),
      });
      setCanDisplayStorage(
        userSession?.user &&
          userHasAccess(APP_LABMANAGEMENT_STORAGE, userSession.user)
      );
      setCanManageGlobalProperties(
        userSession?.user &&
          userHasAccess(MANAGE_GLOBAL_PROPERTIES, userSession.user)
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return (
    <>
      <Tabs
        className={styles.tabs}
        onChange={({ selectedIndex }) => {
          setSelectedTab(selectedIndex);
        }}
        selectedIndex={selectedTab}
      >
        <TabList className={styles.tablist} aria-label="List tabs" contained>
          <Tab className={styles.tab}>
            {t(
              "laboratoryReferrerLocationConfiguration",
              "Reference Locations"
            )}
          </Tab>
          <Tab className={styles.tab}>
            {t("laboratoryDiagnosticCenters", "Lab Sections")}
          </Tab>
          <Tab className={styles.tab}>
            {t("laboratoryTestsConfiguration", "Tests")}
          </Tab>

          <Tab className={styles.tab}>
            {t("laboratoryApprovalsConfiguration", "Approvals")}
          </Tab>
          <Tab className={styles.tab}>
            {t("laboratoryApprovalFlowsConfiguration", "Approval Flows")}
          </Tab>
          {canDisplayStorage ? (
            <Tab className={styles.tab}>
              {t("laboratoryStorageConfiguration", "Storage")}
            </Tab>
          ) : (
            <></>
          )}
        </TabList>
        <TabPanels>
          <TabPanel className={styles.tabPanel}>
            <div className={styles.panelContainer}>
              {selectedTab == 0 && <ReferrerLocationList />}
            </div>
          </TabPanel>

          <TabPanel className={styles.tabPanel}>
            <div className={styles.panelContainer}>
              {selectedTab == 1 && <DiagnosticCenterList />}
            </div>
          </TabPanel>

          <TabPanel className={styles.tabPanel}>
            <div className={styles.panelContainer}>
              {selectedTab == 2 && <TestConfigList />}
            </div>
          </TabPanel>

          <TabPanel className={styles.tabPanel}>
            <div className={styles.panelContainer}>
              {selectedTab == 3 && <ApprovalConfigList />}
            </div>
          </TabPanel>

          <TabPanel className={styles.tabPanel}>
            <div className={styles.panelContainer}>
              {selectedTab == 4 && <ApprovalFlowList />}
            </div>
          </TabPanel>
          {canDisplayStorage ? (
            <TabPanel className={styles.tabPanel}>
              <div className={styles.panelContainer}>
                {selectedTab == 5 && <StorageList />}
              </div>
            </TabPanel>
          ) : (
            <></>
          )}
        </TabPanels>
      </Tabs>
      {canManageGlobalProperties && (
        <div
          className={styles.tabPanel}
          style={{ padding: "0.5rem 1rem", fontSize: "75%" }}
        >
          Click{" "}
          <a href={URL_OPENMRS_LABMANAGEMENT_SETTINGS} target="_blank">
            here
          </a>{" "}
          to access the module openmrs settings.
        </div>
      )}
    </>
  );
};

export default Config;
