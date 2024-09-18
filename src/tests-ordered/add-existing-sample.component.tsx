import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Add } from "@carbon/react/icons";
import styles from "../lab-request/add-lab-request-action-button.component.scss";
import { TestRequestItem } from "../api/types/test-request-item";
import { showModal } from "@openmrs/esm-framework";

const AddExistingSampleActionButton: React.FC<{
  testRequest: TestRequestItem;
}> = ({ testRequest }) => {
  const { t } = useTranslation();

  const onAddSample = useCallback(() => {
    const dispose = showModal("lab-use-existing-sample-dialog", {
      closeModal: (success: boolean) => {
        dispose();
      },
      testRequest: testRequest,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Button
      size="sm"
      className={styles.headerButton}
      iconDescription="Use Existing Sample"
      hasIcon={true}
      renderIcon={(props) => <Add {...props} size={16} />}
      kind="ghost"
      onClick={onAddSample}
    >
      {t("laboratoryUseExistingSample", "Use Existing Sample")}
    </Button>
  );
};

export default AddExistingSampleActionButton;
