import React, { useEffect, useMemo, useState } from "react";
import styles from "./test-config-form.component.scss";
import {
  Button,
  InlineLoading,
  ModalBody,
  ModalFooter,
  FormGroup,
  TextInput,
} from "@carbon/react";
import { useTranslation } from "react-i18next";
import { closeOverlay } from "../../components/overlay/hook";
import {
  ExtensionSlot,
  FetchResponse,
  showNotification,
  showSnackbar,
  showToast,
  useConfig,
  useSession,
  userHasAccess,
} from "@openmrs/esm-framework";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TestConfig,
  requireApprovalOptions,
} from "../../api/types/test-config";
import {
  TestConfigFormData,
  testConfigSchema,
} from "./test-config-validation-schema";
import ConceptsSelector from "../../components/concepts-selector/concepts-selector.component";
import ControlledTextInput from "../../components/controlled-text-input/controlled-text-input.component";
import ControlledRadioButtonGroup from "../../components/controlled-radio-button-group/controlled-radio-button-group.component";
import { Save } from "@carbon/react/icons";
import { TASK_LABMANAGEMENT_TESTCONFIGURATIONS_MUTATE } from "../../config/privileges";
import ApprovalFlowsSelector from "../../components/approval-flow-selector/approval-flow-selector.component";
import {
  createTestConfig,
  updateTestConfig,
} from "../../api/test-config.resource";
import ConceptMembersSelector from "../../components/concepts-selector/concept-members-selector.component";
import { Config } from "../../config-schema";
import { URL_API_TEST_CONFIG } from "../../config/urls";
import { handleMutate } from "../../api/swr-revalidation";
import { useLaboratoryConfig } from "../../hooks/useLaboratoryConfig";

interface TestConfigFormProps {
  model?: TestConfig;
}

const TestConfigForm: React.FC<TestConfigFormProps> = ({ model }) => {
  const { t } = useTranslation();
  const userSession = useSession();
  const [isNew] = useState(!Boolean(model?.uuid));
  const [canEdit, setCanEdit] = useState(isNew);
  const {
    laboratoryConfig: { laboratoryTestGroupConcept },
  } = useLaboratoryConfig();

  useEffect(
    () => {
      setCanEdit(
        userSession?.user &&
          userHasAccess(
            TASK_LABMANAGEMENT_TESTCONFIGURATIONS_MUTATE,
            userSession.user
          )
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const { handleSubmit, control, formState } = useForm<TestConfigFormData>({
    defaultValues: model,
    mode: "all",
    resolver: zodResolver(testConfigSchema),
  });

  const { errors } = formState;
  const handleSave = async (item: TestConfig) => {
    try {
      setIsSaving(true);
      const response: FetchResponse<TestConfig> = await (isNew
        ? createTestConfig
        : updateTestConfig)(item);

      handleMutate(URL_API_TEST_CONFIG);

      if (response?.data) {
        showSnackbar({
          isLowContrast: true,
          title: isNew
            ? t("laboratoryAddTestConfiguration", "Add Test Configuration")
            : t("laboratoryEditTestConfiguration", "Edit Test Configuration"),
          kind: "success",
          subtitle: isNew
            ? t(
                "laboratoryAddTestConfigurationSuccess",
                "Test Configuration Added Successfully"
              )
            : t(
                "laboratoryEditTestConfigurationSuccess",
                "Test Configuration Edited Successfully"
              ),
        });

        closeOverlay();
      }
    } catch (error) {
      setIsSaving(false);
      showNotification({
        title: isNew
          ? t(
              "laboratoryAddTestConfigurationError",
              "Error adding a test configuration"
            )
          : t(
              "laboratoryEditTestConfigurationError",
              "Error editing a test configuration"
            ),
        kind: "error",
        critical: true,
        description: error?.responseBody?.error?.message,
      });
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);

  useEffect(() => {
    setRequireApproval(model?.requireApproval ?? false);
  }, [model?.requireApproval]);

  return (
    <form>
      <ModalBody className={styles.modalBody}>
        {/* {isLoading && (
            <InlineLoading
              className={styles.bannerLoading}
              iconDescription="Loading"
              description="Loading banner"
              status="active"
            />
          )} */}
        <section className={styles.section}>
          {isNew && (
            <ConceptsSelector
              name="testUuid"
              controllerName="testUuid"
              control={control}
              title={t("laboratoryTest", "Test:")}
              placeholder={t("chooseAnItem", "Choose an item")}
              invalid={!!errors.testUuid}
              invalidText={errors.testUuid && errors?.testUuid?.message}
            />
          )}

          {!isNew && (
            <TextInput
              value={model.testName}
              readOnly={true}
              labelText={t("laboratoryTest", "Test:")}
            />
          )}
          {canEdit && (
            <ConceptMembersSelector
              conceptUuid={laboratoryTestGroupConcept}
              selectedId={model.testGroupUuid}
              selectedText={model.testGroupName}
              controllerName={"testGroupUuid"}
              name="testGroupUuid"
              control={control}
              title={t("laboratoryTestGroup", "Test Group:")}
              placeholder={t("chooseAnItem", "Choose an item")}
              invalid={!!errors.testGroupUuid}
              invalidText={
                errors.testGroupUuid && errors?.testGroupUuid?.message
              }
            />
          )}
          {!canEdit && (
            <TextInput
              value={model.testGroupName}
              readOnly={true}
              labelText={t("laboratoryTestGroup", "Test Group:")}
            />
          )}
          {canEdit && (
            <>
              <FormGroup
                className="clear-margin-bottom"
                legendText={t(
                  "laboratoryTestRequireApproval",
                  "Require Approval:"
                )}
                title={t("laboratoryTestRequireApproval", "Require Approval:")}
              >
                <ControlledRadioButtonGroup
                  control={control}
                  defaultSelected={model.requireApproval}
                  name="requireApproval"
                  controllerName="requireApproval"
                  legendText=""
                  invalid={!!errors.requireApproval}
                  invalidText={
                    errors.requireApproval && errors?.requireApproval?.message
                  }
                  onChange={(selection: boolean) => {
                    setRequireApproval(selection);
                  }}
                  options={requireApprovalOptions}
                />
              </FormGroup>
              {errors.requireApproval && errors?.requireApproval?.message && (
                <div className={styles.errorText}>
                  {t(errors?.requireApproval?.message)}
                </div>
              )}
            </>
          )}
          {!canEdit && (
            <TextInput
              value={model.requireApproval ? t("yes", "Yes") : t("no", "No")}
              readOnly={true}
              labelText={t(
                "laboratoryTestRequireApproval",
                "Require Approval:"
              )}
            />
          )}

          {requireApproval && (
            <>
              {canEdit && (
                <ApprovalFlowsSelector
                  name="approvalFlowUuid"
                  controllerName="approvalFlowUuid"
                  control={control}
                  title={t("laboratoryApprovalFlow", "Approval Flow:")}
                  placeholder={t("chooseAnItem", "Choose an item")}
                  invalid={!!errors.approvalFlowUuid}
                  selectedId={model.approvalFlowUuid}
                  selectedText={model.approvalFlowName}
                  invalidText={
                    errors.approvalFlowUuid && errors?.approvalFlowUuid?.message
                  }
                />
              )}
              {!canEdit && (
                <TextInput
                  value={model.approvalFlowName}
                  readOnly={true}
                  labelText={t("laboratoryApprovalFlow", "Approval Flow:")}
                />
              )}
            </>
          )}
          {canEdit && (
            <>
              <FormGroup
                className="clear-margin-bottom"
                legendText={t("laboratoryTestEnable", "Enable Test?:")}
                title={t("laboratoryTestEnable", "Enable Test?:")}
              >
                <ControlledRadioButtonGroup
                  control={control}
                  name="enabled"
                  defaultSelected={model.enabled}
                  controllerName="enabled"
                  legendText=""
                  invalid={!!errors.enabled}
                  onChange={(e) => {}}
                  invalidText={errors.enabled && errors?.enabled?.message}
                  options={requireApprovalOptions}
                />
              </FormGroup>
              {errors.enabled && errors?.enabled?.message && (
                <div className={styles.errorText}>
                  {t(errors?.enabled?.message)}
                </div>
              )}
            </>
          )}

          {!canEdit && (
            <TextInput
              value={model.enabled ? t("yes", "Yes") : t("no", "No")}
              readOnly={true}
              labelText={t("laboratoryTestEnable", "Enable Test?:")}
            />
          )}
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
        <Button onClick={handleSubmit(handleSave)}>
          {isSaving ? <InlineLoading /> : t("save", "Save")}
        </Button>
      </ModalFooter>
    </form>
  );
};

export default TestConfigForm;
