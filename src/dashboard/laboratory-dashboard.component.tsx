import React, { useState } from "react";
import Overlay from "../components/overlay/overlay.component";
import styles from "./laboratory-dashboard.scss";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LaboratoryHeader } from "../header/laboratory-header.component";
import {
  MODULE_BASE_URL,
  URL_LAB_CONFIGURATION,
  URL_LAB_REFERRAL,
  URL_LAB_REPORTS,
} from "../config/urls";
import Laboratory from "../laboratory.component";
import Configuration from "../lab-config/config.component";
import ReferralRequest from "../lab-request/lab-referral-request.component";
import { ILaboratoryNavigation } from "../header/laboratory-navigation";
import { DataTableSkeleton } from "@carbon/react";
import { useLaboratoryConfig } from "../hooks/useLaboratoryConfig";
import LabReports from "../reports/lab-reports.component";
import LaboratoryDashboardTopNav from "./laboratory-top-navigation.component";

export default function LaboratoryDashboard() {
  const [sectionTitle, setSectionTitle] = useState<string>();
  const [showDateInHeader, setShowDateInHeader] = useState<boolean>(false);

  const onPageChanged = (navigationInfo?: ILaboratoryNavigation) => {
    setSectionTitle(navigationInfo?.title);
    setShowDateInHeader(Boolean(navigationInfo?.showDateInHeader));
  };

  const { configReady } = useLaboratoryConfig();

  if (!configReady) return <DataTableSkeleton role="progressbar" />;
  return (
    <main className="omrs-main-content">
      <BrowserRouter basename={MODULE_BASE_URL}>
        <div className={styles.container}>
          <div>
            <LaboratoryHeader
              sectionTitle={sectionTitle}
              showDate={showDateInHeader}
            />
            <div>
              <LaboratoryDashboardTopNav />
            </div>
            <Routes>
              <Route
                path={URL_LAB_CONFIGURATION}
                element={<Configuration onPageChanged={onPageChanged} />}
              />
              <Route
                path={URL_LAB_REFERRAL}
                element={<ReferralRequest onPageChanged={onPageChanged} />}
              />
              <Route
                path={URL_LAB_REPORTS}
                element={<LabReports onPageChanged={onPageChanged} />}
              />
              <Route
                path="*"
                element={<Laboratory onPageChanged={onPageChanged} />}
              />
            </Routes>
          </div>
          <Overlay />
          {/* <WorkspaceContainer overlay contextKey="laboratory" /> */}
        </div>

        {/* <div className={styles.container}>
      </div> */}
      </BrowserRouter>
    </main>
  );
}
