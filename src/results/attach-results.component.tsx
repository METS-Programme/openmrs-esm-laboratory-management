import React, { useState } from "react";
import styles from "./attach-results.component.scss";
import { Button, InlineLoading, FileUploader } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { showNotification, showSnackbar } from "@openmrs/esm-framework";
import { TestConfigImportResult } from "../api/types/test-config";
import { attachTestResult } from "../api/test-config.resource";
import {
  URL_API_TEST_REQUEST,
  URL_API_TEST_REST_ATTACHMENT_DOWNLOAD,
  URL_API_WORKSHEET,
} from "../config/urls";
import { handleMutate } from "../api/swr-revalidation";
import { TestResult } from "../api/types/test-result";

interface AttachResultsProps {
  mode: "Worksheet" | "TestResult";
  testResult?: TestResult;
  worksheetUuid?: string;
  readonly: boolean;
  closeForm?: () => void;
}

const AttachResults: React.FC<AttachResultsProps> = ({
  mode,
  testResult,
  worksheetUuid,
  readonly,
  closeForm,
}) => {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>();
  const [fileNotSelected, setFileNotSelected] = useState(true);
  const [displayErrors, setDisplayErrors] = useState(false);
  const [importResult, setImportResult] = useState<TestConfigImportResult>();
  const [uploadCount, setUploadCount] = useState(0);

  const onConfirmUpload = () => {
    if (!selectedFile) {
      return;
    }
    setDisplayErrors(false);

    const formData = new FormData();
    if (selectedFile) {
      formData.append("file", selectedFile);
      if (mode == "Worksheet") {
        formData.append("worksheetUuid", worksheetUuid);
      } else {
        formData.append("testResultUuid", testResult.uuid);
      }
    }
    setIsSaving(true);
    attachTestResult(formData).then(
      async (resp) => {
        handleMutate(URL_API_TEST_REQUEST);
        handleMutate(URL_API_WORKSHEET);
        let result = (await resp.json()) as any as TestConfigImportResult;
        setImportResult(result);
        setIsSaving(false);
        if (result.success) {
          setUploadCount((e) => e + 1);
          setFileNotSelected(true);
          showSnackbar({
            isLowContrast: true,
            title: t("laboratoryAttachTestResult", "Attach Test Result"),
            kind: "success",
            subtitle: t(
              "laboratoryAttachTestResultSuccess",
              "Test Result Attached Successfully"
            ),
          });
          closeForm?.();
        } else {
          showNotification({
            title: t(
              "laboratoryAttachTestResultError",
              "Error attaching test results"
            ),
            kind: "error",
            critical: true,
            description: result?.errors?.join("\n"),
          });
        }
      },
      (err) => {
        handleMutate(URL_API_TEST_REQUEST);
        handleMutate(URL_API_WORKSHEET);
        setIsSaving(false);
        showNotification({
          title: t(
            "laboratoryAttachTestResultError",
            "Error attaching test results"
          ),
          kind: "error",
          critical: true,
          description: err?.message,
        });
      }
    );
  };

  const onFileChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileNotSelected(false);
    } else {
      event.preventDefault();
    }
  };

  const onFileDeleted = () => {
    setFileNotSelected(true);
  };

  return (
    <>
      <section className={styles.section}>
        <div className={styles.testResultFileItems}>
          <div>
            <p>
              {t("laboratoryTestResultFile", "Test Result File")}:{" "}
              {mode == "TestResult" &&
                (testResult?.hasAttachment || uploadCount > 0) && (
                  <a
                    target="_blank"
                    href={URL_API_TEST_REST_ATTACHMENT_DOWNLOAD(
                      testResult.uuid
                    )}
                  >
                    Download
                  </a>
                )}
            </p>
          </div>
        </div>

        {!readonly && (
          <>
            <div className={styles.testResultFileUpload} key={uploadCount}>
              <FileUploader
                buttonKind="tertiary"
                multiple={false}
                name={"file"}
                buttonLabel="Select file"
                labelDescription="Files at 2mb or less"
                filenameStatus="edit"
                labelTitle=""
                size="small"
                onChange={onFileChanged}
                onDelete={onFileDeleted}
              />
              {!fileNotSelected && (
                <div style={{ alignSelf: "flex-end" }}>
                  <Button onClick={onConfirmUpload} kind="danger">
                    {isSaving ? (
                      <InlineLoading />
                    ) : (
                      t("laboratoryUploadTestResults", "Upload Test Result")
                    )}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </>
  );
};

export default AttachResults;
