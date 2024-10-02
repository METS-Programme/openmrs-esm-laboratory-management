import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { showModal } from "@openmrs/esm-framework";
import { Sample } from "../api/types/sample";
import { ArrowRight } from "@carbon/react/icons";
import { URL_API_SAMPLE, URL_API_TEST_REQUEST } from "../config/urls";
import { handleMutate } from "../api/swr-revalidation";
import { TestRequestItem } from "../api/types/test-request-item";
import { formatTestName } from "../components/test-name";
import { applyTestRequestAction } from "../api/test-request.resource";
import { TestRequestActionTypeSampleRelease } from "../api/types/test-request";

const ReleaseSamplesForTestingActionButton: React.FC<{
  sampleIds: { [key: string]: boolean };
  sampleCollection: Array<Sample>;
}> = ({ sampleIds, sampleCollection }) => {
  const { t } = useTranslation();

  const onReleaseConfirmation = useCallback(
    (remarks: string) => {
      return applyTestRequestAction({
        actionType: TestRequestActionTypeSampleRelease,
        records: Object.entries(sampleIds)
          .filter(([k, v]) => v)
          .map(([k, v]) => k),
        testRequestUuid: sampleCollection[0].testRequestUuid,
      });
    },
    [sampleCollection, sampleIds]
  );

  const handleReleaseLaboratorySample = useCallback(() => {
    const dispose = showModal("lab-approve-test-request-dialog", {
      closeModal: (success: boolean) => {
        if (success) {
          handleMutate(URL_API_TEST_REQUEST);
          handleMutate(URL_API_SAMPLE);
        }
        dispose();
      },
      hideRemarks: true,
      approvalTitle: t(
        "laboratorySampleReleaseForTesting",
        "Release For Testing"
      ),
      approvalDescription: Object.entries(sampleIds)
        .filter(([k, v]) => v)
        .map(([sampleId, selected]) => {
          const sample = sampleCollection.find((p) => p.uuid == sampleId);
          return (
            <div className="laboratory-test-request-approve-item">
              <p>{sample.sampleTypeName}</p>
              <div>{sample.accessionNumber}</div>
              {(sample?.tests as Array<TestRequestItem>)?.length > 0 ? (
                <>
                  <p>
                    {t("laboratorySampleAssociatedTests", "Associated Tests")}
                  </p>
                  <ul>
                    {(sample?.tests as Array<TestRequestItem>)?.map((test) => (
                      <li>
                        {formatTestName(test.testName, test.testShortName)}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>
                  {t(
                    "laboratorySampleNoAssociatedTests",
                    "No Associated Tests"
                  )}
                </p>
              )}
            </div>
          );
        }),
      actionButtonLabel: t("laboratorySampleRelease", "Release"),
      remarksRequired: false,
      approveCallback: onReleaseConfirmation,
      kind: "primary",
      successMessageTitle: t(
        "laboratorySampleReleaseForTesting",
        "Release For Testing"
      ),
      successMessageBody: t(
        "laboratorySampleReleaseForTestingSuccess",
        "Sample(s) released for testing successfully"
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onReleaseConfirmation, sampleCollection, sampleIds]);

  return (
    <Button
      kind="primary"
      size="md"
      onClick={handleReleaseLaboratorySample}
      iconDescription={t(
        "laboratorySampleReleaseForTesting",
        "Release For Testing"
      )}
      renderIcon={(props) => <ArrowRight size={16} {...props} />}
    >
      {t("laboratorySampleReleaseForTesting", "Release For Testing")}
    </Button>
  );
};

export default ReleaseSamplesForTestingActionButton;
