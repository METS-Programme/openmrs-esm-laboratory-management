import React, { useCallback, useEffect, useMemo, useState } from "react";
import { OverflowMenuItem, InlineLoading, Button } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { Upload } from "@carbon/react/icons";
import { WorksheetItem } from "../../api/types/worksheet-item";
import { Worksheet } from "../../api/types/worksheet";
import { formatTestName } from "../../components/test-name";
import { handleMutate } from "../../api/swr-revalidation";
import { showModal } from "@openmrs/esm-framework";
import {
  TestResultImportConceptMapping,
  TestResultImportConfigMappingHeaders,
} from "../../api/types/test-result-import-config";

interface ImportResultsButtonProps {
  worksheetItems: Array<WorksheetItem>;
  disableImport: boolean;
  loadTestResults: (
    mapping: TestResultImportConceptMapping,
    headers: Array<TestResultImportConfigMappingHeaders>,
    sampleIdField: string,
    rows: Array<Array<string>>
  ) => string;
}

const ImportResultsButton: React.FC<ImportResultsButtonProps> = ({
  worksheetItems,
  loadTestResults,
  disableImport,
}) => {
  const { t } = useTranslation();

  const testTypes = useMemo(() => {
    let menuOptions = Object.entries(
      worksheetItems?.reduce((x, y) => {
        if (y?.permission?.canEditTestResults) {
          x[y.testUuid] = formatTestName(y.testName, y.testShortName);
        }
        return x;
      }, {} as { [key: string]: string })
    ).sort(([, valueX], [, valueY]) =>
      valueX?.localeCompare(valueY, undefined, {
        ignorePunctuation: true,
      })
    );

    return menuOptions;
  }, [worksheetItems]);

  const importAction = () => {
    const dispose = showModal("lab-import-test-results-dialog", {
      closeModal: (success: boolean) => {
        if (success) {
        }
        dispose();
      },
      availableTests: testTypes,
      loadTestResults: loadTestResults,
    });
  };

  return testTypes.length > 0 ? (
    <Button
      size="sm"
      iconDescription="Import"
      hasIcon={true}
      renderIcon={(props) => <Upload {...props} size={16} />}
      kind="ghost"
      onClick={importAction}
      disabled={disableImport || !testTypes || testTypes.length == 0}
    >
      {t("laboratoryImportTestResults", "Load Results")}
    </Button>
  ) : (
    <></>
  );
};
export default ImportResultsButton;
