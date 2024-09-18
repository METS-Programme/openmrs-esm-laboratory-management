import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { launchOverlay, closeOverlay } from "../components/overlay/hook";
import LabRequestForm from "./lab-request.component";
import { Add } from "@carbon/react/icons";
import styles from "./add-lab-request-action-button.component.scss";

const AddLabRequestActionButton: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchOverlay(
      t("laboratoryLabRequestNew", "New Laboratory Request"),
      <LabRequestForm mode="other" closeWorkspace={closeOverlay} />
    );
  }, [t]);

  return (
    <Button
      size="sm"
      className={styles.headerButton}
      iconDescription="New Request"
      hasIcon={true}
      renderIcon={(props) => <Add {...props} size={16} />}
      kind="ghost"
      onClick={handleClick}
    >
      {t("laboratoryNewRequest", "New Request")}
    </Button>
  );
};

export default AddLabRequestActionButton;
