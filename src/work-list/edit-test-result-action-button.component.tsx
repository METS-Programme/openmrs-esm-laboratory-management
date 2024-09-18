import React from "react";
import { Button } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { Microscope } from "@carbon/react/icons";
import { TestResult } from "../api/types/test-result";
import { launchOverlay } from "../components/overlay/hook";
import ResultForm from "../results/result-form.component";
import { TestRequestItem } from "../api/types/test-request-item";
import { TestRequest } from "../api/types/test-request";

interface EditTestResultButtonProps {
  className?: string;
  testRequest: TestRequest;
  testRequestItem: TestRequestItem;
}

const EditTestResultButton: React.FC<EditTestResultButtonProps> = ({
  className,
  testRequest,
  testRequestItem,
}) => {
  const { t } = useTranslation();

  return (
    <Button
      className={className}
      kind="ghost"
      size="md"
      onClick={() => {
        launchOverlay(
          t("resultForm", "Lab Results Form"),
          <ResultForm
            testRequestItem={testRequestItem}
            testRequest={testRequest}
            testConcept={testRequestItem?.testConcept}
          />
        );
      }}
      renderIcon={(props) => <Microscope size={16} {...props} />}
      iconDescription={t("laboratoryTestResultEdit", "Edit Test Result")}
    />
  );
};
export default EditTestResultButton;
