import React, { useEffect, useState } from "react";
import styles from "./approval-flow-form.component.scss";
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
  FetchResponse,
  showNotification,
  showSnackbar,
  useSession,
  userHasAccess,
} from "@openmrs/esm-framework";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ApprovalFlow,
  approvalAllowOwnerOptions,
} from "../../api/types/approval-flow";
import {
  ApprovalFlowFormData,
  approvalFlowSchema,
} from "./approval-flow-validation-schema";
import ControlledTextInput from "../../components/controlled-text-input/controlled-text-input.component";
import ControlledRadioButtonGroup from "../../components/controlled-radio-button-group/controlled-radio-button-group.component";
import { TASK_LABMANAGEMENT_TESTCONFIGURATIONS_MUTATE } from "../../config/privileges";
import {
  createApprovalFlow,
  updateApprovalFlow,
} from "../../api/approval-flow.resource";
import { URL_API_APPROVAL_FLOW } from "../../config/urls";
import { handleMutate } from "../../api/swr-revalidation";
import ApprovalConfigurationsSelector from "../../components/approval-config-selector/approval-config-selector.component";

interface ApprovalFlowFormProps {
  model?: ApprovalFlow;
}

const ApprovalFlowForm: React.FC<ApprovalFlowFormProps> = ({ model }) => {
  const { t } = useTranslation();
  const userSession = useSession();
  const [isNew] = useState(!Boolean(model?.uuid));
  const [canEdit, setCanEdit] = useState(isNew);

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

  const { handleSubmit, control, formState, watch } =
    useForm<ApprovalFlowFormData>({
      defaultValues: {
        ...(model ?? {}),
        ...{
          levelTwoAllowOwner: model?.levelTwoAllowOwner ?? false,
          levelThreeAllowOwner: model?.levelThreeAllowOwner ?? false,
          levelFourAllowOwner: model?.levelFourAllowOwner ?? false,
          levelTwoAllowPrevious: model?.levelTwoAllowPrevious ?? false,
          levelThreeAllowPrevious: model?.levelThreeAllowPrevious ?? false,
          levelFourAllowPrevious: model?.levelFourAllowPrevious ?? false,
        },
      },
      mode: "all",
      resolver: zodResolver(approvalFlowSchema),
    });

  const { errors } = formState;
  const watchLevelTwoUuid = watch("levelTwoUuid");
  const watchLevelThreeUuid = watch("levelThreeUuid");
  const watchLevelFourUuid = watch("levelFourUuid");

  const handleSave = async (item: ApprovalFlow) => {
    try {
      setIsSaving(true);
      const response: FetchResponse<ApprovalFlow> = await (isNew
        ? createApprovalFlow
        : updateApprovalFlow)(item);

      handleMutate(URL_API_APPROVAL_FLOW);

      if (response?.data) {
        showSnackbar({
          isLowContrast: true,
          title: isNew
            ? t("laboratoryAddApprovalFlow", "Add Approval Flow")
            : t("laboratoryEditApprovalFlow", "Edit Approval Flow"),
          kind: "success",
          subtitle: isNew
            ? t(
                "laboratoryAddApprovalFlowSuccess",
                "Approval Flow Added Successfully"
              )
            : t(
                "laboratoryEditApprovalFlowSuccess",
                "Approval Flow Edited Successfully"
              ),
          autoClose: true,
        });

        closeOverlay();
      }
    } catch (error) {
      setIsSaving(false);
      showNotification({
        title: isNew
          ? t(
              "laboratoryAddApprovalFlowurationError",
              "Error adding a approval flow"
            )
          : t(
              "laboratoryEditApprovalFlowurationError",
              "Error editing a approval flow"
            ),
        kind: "error",
        critical: true,
        description: error?.responseBody?.error?.message,
      });
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  return (
    <form>
      <ModalBody className={styles.modalBody}>
        {/* <div className={styles.errorText}>
          {Object.entries(errors).map(([key, error]) => (
            <div>
              {key}:{error.message}
            </div>
          ))}
        </div> */}
        <section className={styles.section}>
          <ControlledTextInput
            readOnly={!canEdit}
            id="name"
            name="name"
            control={control}
            controllerName="name"
            maxLength={100}
            size={"md"}
            value={`${model?.name ?? ""}`}
            labelText={t("laboratoryApprovalFlowName", "Name:")}
            helperText={t(
              "laboratoryApprovalFlowNameHelpText",
              "Friendly name of this approval flow"
            )}
            invalid={!!errors.name}
            invalidText={errors.name && errors?.name?.message}
          />

          <ControlledTextInput
            readOnly={!canEdit}
            id="systemName"
            name="systemName"
            control={control}
            controllerName="systemName"
            maxLength={100}
            size={"md"}
            value={`${model?.systemName ?? ""}`}
            labelText={t("laboratoryApprovalFlowSystemName", "System Name:")}
            helperText={t(
              "laboratoryApprovalFlowSystemNameHelpText",
              "Reference name used in the test configurations import file"
            )}
            invalid={!!errors.systemName}
            invalidText={errors.systemName && errors?.systemName?.message}
          />

          {canEdit && (
            <ApprovalConfigurationsSelector
              selectedId={model.levelOneUuid}
              selectedText={model.levelOneApprovalTitle}
              controllerName={"levelOneUuid"}
              name="levelOneUuid"
              control={control}
              title={t("laboratoryApprovalFlowEditLevelOne", "Level One:")}
              placeholder={t("chooseAnItem", "Choose Approval")}
              invalid={!!errors.levelOneUuid}
              invalidText={errors.levelOneUuid && errors?.levelOneUuid?.message}
            />
          )}
          {!canEdit && (
            <TextInput
              value={model.levelOneApprovalTitle}
              readOnly={true}
              labelText={t("laboratoryApprovalFlowEditLevelOne", "Level One:")}
            />
          )}
          {canEdit && (
            <FormGroup
              className="clear-margin-bottom"
              legendText={t(
                "laboratoryApprovalFlowEditLevelOneAllowOwner",
                "Level One: Owner Can Approve"
              )}
              title={t(
                "laboratoryApprovalFlowEditLevelOneAllowOwner",
                "Level One: Owner Can Approve"
              )}
            >
              <ControlledRadioButtonGroup
                control={control}
                defaultSelected={model.levelOneAllowOwner}
                name="levelOneAllowOwner"
                controllerName="levelOneAllowOwner"
                legendText=""
                invalid={!!errors.levelOneAllowOwner}
                onChange={(e) => {}}
                invalidText={
                  errors.levelOneAllowOwner &&
                  errors?.levelOneAllowOwner?.message
                }
                options={approvalAllowOwnerOptions}
              />
            </FormGroup>
          )}
          {!canEdit && (
            <TextInput
              value={model.levelOneAllowOwner ? t("yes", "Yes") : t("no", "No")}
              readOnly={true}
              labelText={t(
                "laboratoryApprovalFlowEditLevelOneAllowOwner",
                "Level One: Owner Can Approve"
              )}
            />
          )}

          {canEdit && (
            <ApprovalConfigurationsSelector
              selectedId={model.levelTwoUuid}
              selectedText={model.levelTwoApprovalTitle}
              controllerName={"levelTwoUuid"}
              name="levelTwoUuid"
              control={control}
              title={t("laboratoryApprovalFlowEditLevelTwo", "Level Two:")}
              placeholder={t("notApplicable", "Not Applicable")}
              invalid={!!errors.levelTwoUuid}
              invalidText={errors.levelTwoUuid && errors?.levelTwoUuid?.message}
            />
          )}
          {!canEdit && (
            <TextInput
              value={model.levelTwoApprovalTitle}
              readOnly={true}
              labelText={t("laboratoryApprovalFlowEditLevelTwo", "Level Two:")}
            />
          )}

          {watchLevelTwoUuid && (
            <div className={styles.approvalLevelOptions}>
              {canEdit && (
                <FormGroup
                  className="clear-margin-bottom"
                  legendText={t(
                    "laboratoryApprovalFlowEditLevelTwoAllowOwner",
                    "Level Two: Owner Can Approve"
                  )}
                  title={t(
                    "laboratoryApprovalFlowEditLevelTwoAllowOwner",
                    "Level Two: Owner Can Approve"
                  )}
                >
                  <ControlledRadioButtonGroup
                    control={control}
                    defaultSelected={model.levelTwoAllowOwner ?? false}
                    name="levelTwoAllowOwner"
                    controllerName="levelTwoAllowOwner"
                    legendText=""
                    invalid={!!errors.levelTwoAllowOwner}
                    onChange={(e) => {}}
                    invalidText={
                      errors.levelTwoAllowOwner &&
                      errors?.levelTwoAllowOwner?.message
                    }
                    options={approvalAllowOwnerOptions}
                  />
                </FormGroup>
              )}
              {!canEdit && (
                <TextInput
                  value={
                    model.levelTwoAllowOwner ? t("yes", "Yes") : t("no", "No")
                  }
                  readOnly={true}
                  labelText={t(
                    "laboratoryApprovalFlowEditLevelTwoAllowOwner",
                    "Level Two: Owner Can Approve"
                  )}
                />
              )}
              {canEdit && (
                <FormGroup
                  className="clear-margin-bottom"
                  legendText={t(
                    "laboratoryApprovalFlowEditLevelTwoAllowPrevious",
                    "Level Two: Previous Approver Can Approve"
                  )}
                  title={t(
                    "laboratoryApprovalFlowEditLevelTwoAllowPrevious",
                    "Level Two: Previous Approver Can Approve"
                  )}
                >
                  <ControlledRadioButtonGroup
                    control={control}
                    defaultSelected={model.levelTwoAllowPrevious ?? false}
                    name="levelTwoAllowPrevious"
                    controllerName="levelTwoAllowPrevious"
                    legendText=""
                    invalid={!!errors.levelTwoAllowPrevious}
                    onChange={(e) => {}}
                    invalidText={
                      errors.levelTwoAllowPrevious &&
                      errors?.levelTwoAllowPrevious?.message
                    }
                    options={approvalAllowOwnerOptions}
                  />
                </FormGroup>
              )}
              {!canEdit && (
                <TextInput
                  value={
                    model.levelTwoAllowPrevious
                      ? t("yes", "Yes")
                      : t("no", "No")
                  }
                  readOnly={true}
                  labelText={t(
                    "laboratoryApprovalFlowEditLevelTwoAllowPrevious",
                    "Level Two: Previous Approver Can Approve"
                  )}
                />
              )}
            </div>
          )}

          {canEdit && (
            <ApprovalConfigurationsSelector
              selectedId={model.levelThreeUuid}
              selectedText={model.levelThreeApprovalTitle}
              controllerName={"levelThreeUuid"}
              name="levelThreeUuid"
              control={control}
              title={t("laboratoryApprovalFlowEditLevelThree", "Level Three:")}
              placeholder={t("notApplicable", "Not Applicable")}
              invalid={!!errors.levelThreeUuid}
              invalidText={
                errors.levelThreeUuid && errors?.levelThreeUuid?.message
              }
            />
          )}
          {!canEdit && (
            <TextInput
              value={model.levelThreeApprovalTitle}
              readOnly={true}
              labelText={t(
                "laboratoryApprovalFlowEditLevelThree",
                "Level Three:"
              )}
            />
          )}

          {watchLevelThreeUuid && (
            <div className={styles.approvalLevelOptions}>
              {canEdit && (
                <FormGroup
                  className="clear-margin-bottom"
                  legendText={t(
                    "laboratoryApprovalFlowEditLevelThreeAllowOwner",
                    "Level Three: Owner Can Approve"
                  )}
                  title={t(
                    "laboratoryApprovalFlowEditLevelThreeAllowOwner",
                    "Level Three: Owner Can Approve"
                  )}
                >
                  <ControlledRadioButtonGroup
                    control={control}
                    defaultSelected={model.levelThreeAllowOwner ?? false}
                    name="levelThreeAllowOwner"
                    controllerName="levelThreeAllowOwner"
                    legendText=""
                    invalid={!!errors.levelThreeAllowOwner}
                    onChange={(e) => {}}
                    invalidText={
                      errors.levelThreeAllowOwner &&
                      errors?.levelThreeAllowOwner?.message
                    }
                    options={approvalAllowOwnerOptions}
                  />
                </FormGroup>
              )}
              {!canEdit && (
                <TextInput
                  value={
                    model.levelThreeAllowOwner ? t("yes", "Yes") : t("no", "No")
                  }
                  readOnly={true}
                  labelText={t(
                    "laboratoryApprovalFlowEditLevelThreeAllowOwner",
                    "Level Three: Owner Can Approve"
                  )}
                />
              )}
              {canEdit && (
                <FormGroup
                  className="clear-margin-bottom"
                  legendText={t(
                    "laboratoryApprovalFlowEditLevelThreeAllowPrevious",
                    "Level Three: Previous Approver Can Approve"
                  )}
                  title={t(
                    "laboratoryApprovalFlowEditLevelThreeAllowPrevious",
                    "Level Three: Previous Approver Can Approve"
                  )}
                >
                  <ControlledRadioButtonGroup
                    control={control}
                    defaultSelected={model.levelThreeAllowPrevious ?? false}
                    name="levelThreeAllowPrevious"
                    controllerName="levelThreeAllowPrevious"
                    legendText=""
                    invalid={!!errors.levelThreeAllowPrevious}
                    onChange={(e) => {}}
                    invalidText={
                      errors.levelThreeAllowPrevious &&
                      errors?.levelThreeAllowPrevious?.message
                    }
                    options={approvalAllowOwnerOptions}
                  />
                </FormGroup>
              )}
              {!canEdit && (
                <TextInput
                  value={
                    model.levelThreeAllowPrevious
                      ? t("yes", "Yes")
                      : t("no", "No")
                  }
                  readOnly={true}
                  labelText={t(
                    "laboratoryApprovalFlowEditLevelThreeAllowPrevious",
                    "Level Three: Previous Approver Can Approve"
                  )}
                />
              )}
            </div>
          )}

          {canEdit && (
            <ApprovalConfigurationsSelector
              selectedId={model.levelFourUuid}
              selectedText={model.levelFourApprovalTitle}
              controllerName={"levelFourUuid"}
              name="levelFourUuid"
              control={control}
              title={t("laboratoryApprovalFlowEditLevelFour", "Level Four:")}
              placeholder={t("notApplicable", "Not Applicable")}
              invalid={!!errors.levelFourUuid}
              invalidText={
                errors.levelFourUuid && errors?.levelFourUuid?.message
              }
            />
          )}
          {!canEdit && (
            <TextInput
              value={model.levelFourApprovalTitle}
              readOnly={true}
              labelText={t(
                "laboratoryApprovalFlowEditLevelFour",
                "Level Four:"
              )}
            />
          )}

          {watchLevelFourUuid && (
            <div className={styles.approvalLevelOptions}>
              {canEdit && (
                <FormGroup
                  className="clear-margin-bottom"
                  legendText={t(
                    "laboratoryApprovalFlowEditLevelFourAllowOwner",
                    "Level Four: Owner Can Approve"
                  )}
                  title={t(
                    "laboratoryApprovalFlowEditLevelFourAllowOwner",
                    "Level Four: Owner Can Approve"
                  )}
                >
                  <ControlledRadioButtonGroup
                    control={control}
                    defaultSelected={model.levelFourAllowOwner ?? false}
                    name="levelFourAllowOwner"
                    controllerName="levelFourAllowOwner"
                    legendText=""
                    invalid={!!errors.levelFourAllowOwner}
                    onChange={(e) => {}}
                    invalidText={
                      errors.levelFourAllowOwner &&
                      errors?.levelFourAllowOwner?.message
                    }
                    options={approvalAllowOwnerOptions}
                  />
                </FormGroup>
              )}
              {!canEdit && (
                <TextInput
                  value={
                    model.levelFourAllowOwner ? t("yes", "Yes") : t("no", "No")
                  }
                  readOnly={true}
                  labelText={t(
                    "laboratoryApprovalFlowEditLevelFourAllowOwner",
                    "Level Four: Owner Can Approve"
                  )}
                />
              )}
              {canEdit && (
                <FormGroup
                  className="clear-margin-bottom"
                  legendText={t(
                    "laboratoryApprovalFlowEditLevelFourAllowPrevious",
                    "Level Four: Previous Approver Can Approve"
                  )}
                  title={t(
                    "laboratoryApprovalFlowEditLevelFourAllowPrevious",
                    "Level Four: Previous Approver Can Approve"
                  )}
                >
                  <ControlledRadioButtonGroup
                    control={control}
                    defaultSelected={model.levelFourAllowPrevious ?? false}
                    name="levelFourAllowPrevious"
                    controllerName="levelFourAllowPrevious"
                    legendText=""
                    invalid={!!errors.levelFourAllowPrevious}
                    onChange={(e) => {}}
                    invalidText={
                      errors.levelFourAllowPrevious &&
                      errors?.levelFourAllowPrevious?.message
                    }
                    options={approvalAllowOwnerOptions}
                  />
                </FormGroup>
              )}
              {!canEdit && (
                <TextInput
                  value={
                    model.levelFourAllowPrevious
                      ? t("yes", "Yes")
                      : t("no", "No")
                  }
                  readOnly={true}
                  labelText={t(
                    "laboratoryApprovalFlowEditLevelFourAllowPrevious",
                    "Level Four: Previous Approver Can Approve"
                  )}
                />
              )}
            </div>
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

export default ApprovalFlowForm;
