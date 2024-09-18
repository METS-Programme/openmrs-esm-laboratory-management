import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { DataEnrichmentAdd } from "@carbon/react/icons";
import styles from "./add-lab-request-action-button.component.scss";
import { URL_LAB_REFERRAL_ABS } from "../config/urls";
import { navigate } from "@openmrs/esm-framework";

const AddLabRequestActionButton: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Button
      size="sm"
      className={styles.headerButton}
      iconDescription="New Referral"
      hasIcon={true}
      renderIcon={(props) => <DataEnrichmentAdd {...props} size={16} />}
      kind="ghost"
      onClick={() =>
        navigate({
          to: URL_LAB_REFERRAL_ABS,
        })
      }
    >
      {t("laboratoryNewReferral", "Referral")}
    </Button>
  );
};

export default AddLabRequestActionButton;
