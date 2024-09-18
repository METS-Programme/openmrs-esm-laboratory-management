import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Catalog, Customer, Archive } from "@carbon/react/icons";

import { Button } from "@carbon/react";
import styles from "../tests-ordered/laboratory-queue.scss";
import { navigate, userHasAccess, useSession } from "@openmrs/esm-framework";
import {
  URL_LAB_SAMPLES,
  URL_LAB_SAMPLES_ABS,
  URL_LAB_SAMPLES_HISTORY,
  URL_LAB_SAMPLES_HISTORY_ABS,
  URL_LAB_SAMPLES_REPOSITORY,
  URL_LAB_SAMPLES_REPOSITORY_ABS,
} from "../config/urls";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import SampleCollectonList from "../tests-ordered/sample-collection-list.component";
import SampleStorageList from "./storage/sample-storage-list.component";
import SampleHistoryList from "./storage/sample-history-list.component";
import { APP_LABMANAGEMENT_REPOSITORY } from "../config/privileges";

interface SamplesHomeProps {}

const SamplesHome: React.FC<SamplesHomeProps> = () => {
  const { t } = useTranslation();
  const { pathname: currentUrlPath } = useLocation();
  const summarySelected = currentUrlPath.startsWith(URL_LAB_SAMPLES_HISTORY);
  const repositorySelected =
    !summarySelected && currentUrlPath.startsWith(URL_LAB_SAMPLES_REPOSITORY);
  const userSession = useSession();
  const [canSeeRepository, setCanSeeRepository] = useState(false);

  useEffect(() => {
    setCanSeeRepository(
      userSession?.user &&
        userHasAccess(APP_LABMANAGEMENT_REPOSITORY, userSession.user)
    );
  }, [userSession.user]);

  return (
    <>
      <div className={styles.navigationButtons}>
        <Button
          size="sm"
          className={styles.navigationButton}
          iconDescription="Collection"
          hasIcon={true}
          renderIcon={(props) => <Customer {...props} size={16} />}
          kind={!summarySelected && !repositorySelected ? "secondary" : "ghost"}
          onClick={() =>
            navigate({
              to: URL_LAB_SAMPLES_ABS,
            })
          }
        >
          {t("laboratorySamplesCollection", "Pending Sample Collection")}
        </Button>
        <Button
          size="sm"
          className={styles.navigationButton}
          iconDescription="Sample History"
          hasIcon={true}
          renderIcon={(props) => <Catalog {...props} size={16} />}
          kind={summarySelected ? "secondary" : "ghost"}
          onClick={() =>
            navigate({
              to: URL_LAB_SAMPLES_HISTORY_ABS,
            })
          }
          hreft={URL_LAB_SAMPLES_HISTORY_ABS}
        >
          {t("laboratorySamplesManage", "Sample History")}
        </Button>
        {canSeeRepository && (
          <Button
            size="sm"
            className={styles.navigationButton}
            iconDescription="Sample Repository"
            hasIcon={true}
            renderIcon={(props) => <Archive {...props} size={16} />}
            kind={repositorySelected ? "secondary" : "ghost"}
            onClick={() =>
              navigate({
                to: URL_LAB_SAMPLES_REPOSITORY_ABS,
              })
            }
            hreft={URL_LAB_SAMPLES_REPOSITORY_ABS}
          >
            {t("laboratorySamplesRepository", "Sample Repository")}
          </Button>
        )}
      </div>
      <Routes>
        <Route path={"history"} element={<SampleHistoryList />} />
        {canSeeRepository && (
          <Route path={"repository"} element={<SampleStorageList />} />
        )}
        <Route path={"/"} element={<SampleCollectonList />} />
        <Route
          key="default-route"
          path={"*"}
          element={<Navigate to={URL_LAB_SAMPLES} />}
        />
      </Routes>
    </>
  );
};

export default SamplesHome;
