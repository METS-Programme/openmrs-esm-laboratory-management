import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import styles from "../lab-request/add-lab-request-action-button.component.scss";
import { showModal } from "@openmrs/esm-framework";
import { Sample } from "../api/types/sample";
import { TestRequest } from "../api/types/test-request";
import { SampleReferenceDisplay } from "../components/sample-reference-display";
import { getEntityName } from "../components/test-request/entity-name";

const EditSampleActionLink: React.FC<{
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
      size="sm"
      className={styles.headerButton}
      iconDescription="Edit Sample"
      kind="ghost"
      onClick={onAddSample}
    >
      <SampleReferenceDisplay
        reference={sample.accessionNumber}
        className={refClassName}
        sampleType={sample.sampleTypeName}
        entityName={getEntityName(testRequest)}
      />
    </Button>
  );
};

export default EditSampleActionLink;
