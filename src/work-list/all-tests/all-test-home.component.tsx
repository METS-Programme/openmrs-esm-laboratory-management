import React from "react";
import { useTranslation } from "react-i18next";
import { Catalog, Customer } from "@carbon/react/icons";

import { Button } from "@carbon/react";
import styles from "../../tests-ordered/laboratory-queue.scss";
import { navigate } from "@openmrs/esm-framework";
import {
  URL_LAB_REQUESTS_ALL,
  URL_LAB_REQUESTS_ALL_ABS,
  URL_LAB_REQUESTS_ALL_SUMMARY,
  URL_LAB_REQUESTS_ALL_SUMMARY_ABS,
} from "../../config/urls";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AllTestRequests from "./all-test-requests.component";
import SummaryRequests from "./summary-requests.component";

interface AllTestsHomeProps {}

const AllTestsHome: React.FC<AllTestsHomeProps> = () => {
  const { t } = useTranslation();
  const { pathname: currentUrlPath } = useLocation();
  const summarySelected = currentUrlPath.startsWith(
    URL_LAB_REQUESTS_ALL_SUMMARY
  );
  return (
    <>
      <div className={styles.navigationButtons}>
        <Button
          size="sm"
          className={styles.navigationButton}
          iconDescription="Requests"
          hasIcon={true}
          renderIcon={(props) => <Customer {...props} size={16} />}
          kind={summarySelected ? "ghost" : "secondary"}
          onClick={() =>
            navigate({
              to: URL_LAB_REQUESTS_ALL_ABS,
            })
          }
        >
          {t("laboratoryAllTestsRequests", "Requests")}
        </Button>
        <Button
          size="sm"
          className={styles.navigationButton}
          iconDescription="Summary"
          hasIcon={true}
          renderIcon={(props) => <Catalog {...props} size={16} />}
          kind={summarySelected ? "secondary" : "ghost"}
          onClick={() =>
            navigate({
              to: URL_LAB_REQUESTS_ALL_SUMMARY_ABS,
            })
          }
          hreft={URL_LAB_REQUESTS_ALL_SUMMARY_ABS}
        >
          {t("laboratorySummaryRequests", "Request Summary")}
        </Button>
      </div>
      <Routes>
        <Route path={"summary"} element={<SummaryRequests />} />
        <Route path={"/"} element={<AllTestRequests />} />
        <Route
          key="default-route"
          path={"*"}
          element={<Navigate to={URL_LAB_REQUESTS_ALL} />}
        />
      </Routes>
    </>
  );
};

export default AllTestsHome;
