import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { showModal } from "@openmrs/esm-framework";
import { Sample } from "../api/types/sample";
import { TestRequest } from "../api/types/test-request";
import { Edit } from "@carbon/react/icons";

const EditSampleActionButton: React.FC<{
  sample: Sample;
  testRequest: TestRequest;
  refClassName?: string;
}> = ({ sample, testRequest, refClassName }) => {
  const { t } = useTranslation();

  const onAddSample = useCallback(() => {
    const dispose = showModal("lab-register-sample-dialog", {
      closeModal: (success: boolean) => {
        dispose();
      },
      testRequest: testRequest,
      sample: sample,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Button
      kind="ghost"
      size="md"
      onClick={onAddSample}
      iconDescription={t("editLaboratorySample", "Edit Sample")}
      renderIcon={(props) => <Edit size={16} {...props} />}
    ></Button>
  );
};

export default EditSampleActionButton;
