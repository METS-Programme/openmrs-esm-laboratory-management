import React, { ChangeEvent, useState } from "react";
import styles from "./test-config-form.component.scss";
import {
  Button,
  InlineLoading,
  ModalBody,
  ModalFooter,
  FileUploader,
  FormGroup,
  RadioButton,
  RadioButtonGroup,
} from "@carbon/react";
import { useTranslation } from "react-i18next";
import { closeOverlay } from "../../components/overlay/hook";
import { showNotification, showSnackbar } from "@openmrs/esm-framework";
import { TestConfigImportResult } from "../../api/types/test-config";
import { uploadTestConfigurations } from "../../api/test-config.resource";
import {
  URL_API_TEST_CONFIG,
  URL_IMPORT_TEMPLATE_FILE,
  URL_TEST_CONFIG_IMPORT_ERROR_FILE,
} from "../../config/urls";
import { handleMutate } from "../../api/swr-revalidation";

interface TestImportProps {}

const TestImport: React.FC<TestImportProps> = () => {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>();
  const [hasHeader, setHasHeader] = useState(true);
  const [fileNotSelected, setFileNotSelected] = useState(true);
  const [displayErrors, setDisplayErrors] = useState(false);
  const [importResult, setImportResult] = useState<TestConfigImportResult>();

  const onConfirmUpload = () => {
    if (!selectedFile) {
      return;
    }
    setDisplayErrors(false);

    const formData = new FormData();
    if (selectedFile) {
      formData.append("file", selectedFile, "Import_Test_Configurations.csv");
      formData.append("hasHeader", hasHeader ? "true" : "false");
    }
    uploadTestConfigurations(formData).then(
      async (resp) => {
        handleMutate(URL_API_TEST_CONFIG);
        let result = (await resp.json()) as any as TestConfigImportResult;
        setImportResult(result);
        setIsSaving(false);
        if (result.success) {
          showSnackbar({
            isLowContrast: true,
            title: t(
              "laboratoryUploadedTestConfiguration",
              "Uploaded Test Configuration"
            ),
            kind: "success",
            subtitle: t(
              "laboratoryUploadedTestConfigurationSuccess",
              "Test Configuration Uploaded Successfully"
            ),
          });
          closeOverlay();
        } else {
          setDisplayErrors(true);
        }
      },
      (err) => {
        handleMutate(URL_API_TEST_CONFIG);
        setIsSaving(false);
        showNotification({
          title: t(
            "laboratoryUploadTestConfigurationError",
            "Error uploading test configurations"
          ),
          kind: "error",
          critical: true,
          description: err?.message,
        });
      }
    );
  };

  const onHasHeaderChanged = (
    selection: string,
    name: string,
    evt: ChangeEvent<HTMLInputElement>
  ) => {
    setHasHeader(selection === "true");
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
      <ModalBody className={styles.modalBody}>
        <section className={styles.section}>
          {displayErrors && (
            <div>
              <div>
                Test configurations created: <b>{importResult?.createdCount}</b>{" "}
                Updated: <b>{importResult?.updatedCount}</b> Not Changed:{" "}
                <b>{importResult?.notChangedCount}</b>
              </div>
              <div className={styles.errorText}>
                {importResult?.errors && (
                  <>
                    <ul>
                      {importResult?.errors.map((p) => (
                        <li>{p}</li>
                      ))}
                    </ul>
                  </>
                )}
                {importResult?.hasErrorFile && importResult.uploadSessionId && (
                  <div>
                    Click{" "}
                    <a
                      rel="noreferrer"
                      href={URL_TEST_CONFIG_IMPORT_ERROR_FILE(
                        importResult.uploadSessionId
                      )}
                      target={"_blank"}
                    >
                      here
                    </a>{" "}
                    to access the error log file.
                  </div>
                )}
              </div>
            </div>
          )}
          <FileUploader
            accept={[".csv"]}
            multiple={false}
            name={"file"}
            buttonLabel="Select file"
            labelDescription="Only .csv files at 2mb or less"
            filenameStatus="edit"
            labelTitle=""
            size="small"
            onChange={onFileChanged}
            onDelete={onFileDeleted}
          />
          <FormGroup
            className="clear-margin-bottom"
            legendText={t(
              "laboratoryTestImportHasHeader",
              "Does the csv file include headers?"
            )}
            title={t(
              "laboratoryTestImportHasHeader",
              "Does the csv file include headers?"
            )}
          >
            <RadioButtonGroup
              name="hasHeader"
              defaultSelected={"true"}
              legendText=""
              onChange={onHasHeaderChanged}
            >
              <RadioButton
                value="true"
                id="hasHeader-true"
                labelText={t("yes", "Yes")}
              />
              <RadioButton
                value="false"
                id="hasHeader-false"
                labelText={t("no", "No")}
              />
            </RadioButtonGroup>
          </FormGroup>

          <div>
            Download{" "}
            <a
              rel="noreferrer"
              href={URL_IMPORT_TEMPLATE_FILE}
              target={"_blank"}
            >
              template
            </a>
          </div>
        </section>
      </ModalBody>
      <ModalFooter>
        <Button
          disabled={isSaving}
          onClick={() => closeOverlay()}
          kind="secondary"
        >
          {t("cancel", "Cancel")}
        </Button>
        <Button onClick={onConfirmUpload}>
          {isSaving ? (
            <InlineLoading />
          ) : (
            t("laboratoryUploadTests", "Upload Tests")
          )}
        </Button>
      </ModalFooter>
    </>
  );
};

export default TestImport;
