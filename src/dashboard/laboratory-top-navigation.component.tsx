import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings, AnalyticsReference, Home } from "@carbon/react/icons";
import { useSession, userHasAccess, navigate } from "@openmrs/esm-framework";
import styles from "./laboratory-dashboard.scss";
import { Button } from "@carbon/react";
import {
  MODULE_BASE_URL,
  URL_LAB_CONFIGURATION_ABS,
  URL_LAB_REPORTS_ABS,
} from "../config/urls";
import {
  APP_LABMANAGEMENT_REPORTS,
  TASK_LABMANAGEMENT_TESTREQUESTS_MUTATE,
} from "../config/privileges";
import AddNewLabRequestButton from "../lab-request/add-lab-request-action-button.component";
import AddNewLabReferralRequestButton from "../lab-request/add-lab-referral-action-button.component";

const LaboratoryDashboardTopNav = () => {
  const { t } = useTranslation();
  const [canAddNewRequest, setCanAddNewRequest] = useState(false);
  const [canViewReports, setCanViewReports] = useState(false);
  const userSession = useSession();
  useEffect(() => {
    setCanAddNewRequest(
      userSession?.user &&
        userHasAccess(TASK_LABMANAGEMENT_TESTREQUESTS_MUTATE, userSession.user)
    );
    setCanViewReports(
      userSession?.user &&
        userHasAccess(APP_LABMANAGEMENT_REPORTS, userSession.user)
    );
  }, [userSession]);

  return (
    <div className={`${styles.headerActions}`}>
      <Button
        size="sm"
        className={styles.headerButton}
        iconDescription="Home"
        hasIcon={true}
        renderIcon={(props) => <Home {...props} size={16} />}
        kind="ghost"
        onClick={() =>
          navigate({
            to: MODULE_BASE_URL,
          })
        }
      >
        {t("laboratoryHome", "Home")}
      </Button>

      {canAddNewRequest && (
        <>
          <AddNewLabRequestButton />
          <AddNewLabReferralRequestButton />
        </>
      )}

      {canViewReports && (
        <Button
          size="sm"
          className={styles.headerButton}
          iconDescription="Reports"
          hasIcon={true}
          renderIcon={(props) => <AnalyticsReference {...props} size={16} />}
          kind="ghost"
          onClick={() =>
            navigate({
              to: URL_LAB_REPORTS_ABS,
            })
          }
        >
          {t("laboratoryReports", "Reports")}
        </Button>
      )}

      <Button
        size="sm"
        className={styles.headerButton}
        iconDescription="Settings"
        hasIcon={true}
        renderIcon={(props) => <Settings {...props} size={16} />}
        kind="ghost"
        onClick={() =>
          navigate({
            to: URL_LAB_CONFIGURATION_ABS,
          })
        }
      >
        {t("laboratorySettings", "Settings")}
      </Button>
    </div>
  );
};

export default LaboratoryDashboardTopNav;
