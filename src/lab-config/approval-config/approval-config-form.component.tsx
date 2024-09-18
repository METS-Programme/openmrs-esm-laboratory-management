import React, { useEffect, useState } from "react";
import styles from "./approval-config-form.component.scss";
import { Button, InlineLoading, ModalBody, ModalFooter } from "@carbon/react";
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
import { ApprovalConfig } from "../../api/types/approval-config";
import {
  ApprovalConfigFormData,
  approvalConfigSchema,
} from "./approval-config-validation-schema";
import ControlledTextInput from "../../components/controlled-text-input/controlled-text-input.component";
import { TASK_LABMANAGEMENT_TESTCONFIGURATIONS_MUTATE } from "../../config/privileges";
import {
  createApprovalConfig,
  updateApprovalConfig,
} from "../../api/approval-config.resource";
import { URL_API_APPROVAL_CONFIG } from "../../config/urls";
import { handleMutate } from "../../api/swr-revalidation";

interface ApprovalConfigFormProps {
  model?: ApprovalConfig;
}

const ApprovalConfigForm: React.FC<ApprovalConfigFormProps> = ({ model }) => {
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
    useForm<ApprovalConfigFormData>({
      defaultValues: model,
      mode: "all",
      resolver: zodResolver(approvalConfigSchema),
    });

  const { errors } = formState;

  const handleSave = async (item: ApprovalConfig) => {
    try {
      setIsSaving(true);
      const response: FetchResponse<ApprovalConfig> = await (isNew
        ? createApprovalConfig
        : updateApprovalConfig)(item);

      handleMutate(URL_API_APPROVAL_CONFIG);

      if (response?.data) {
        showSnackbar({
          isLowContrast: true,
          title: isNew
            ? t("laboratoryAddApprovalConfig", "Add Approval")
            : t("laboratoryEditApprovalConfig", "Edit Approval"),
          kind: "success",
          subtitle: isNew
            ? t(
                "laboratoryAddApprovalConfigSuccess",
                "Approval Added Successfully"
              )
            : t(
                "laboratoryEditApprovalConfigSuccess",
                "Approval Edited Successfully"
              ),
        });

        closeOverlay();
      }
    } catch (error) {
      setIsSaving(false);
      showNotification({
        title: isNew
          ? t(
              "laboratoryAddApprovalConfigurationError",
              "Error adding approval"
            )
          : t(
              "laboratoryEditApprovalConfigurationError",
              "Error editing a approval"
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
        <section className={styles.section}>
          <ControlledTextInput
            readOnly={!canEdit}
            id="approvalTitle"
            name="approvalTitle"
            control={control}
            controllerName="approvalTitle"
            maxLength={100}
            size={"md"}
            value={`${model?.approvalTitle ?? ""}`}
            labelText={t("laboratoryApprovalConfigTitle", "Approval Title:")}
            helperText={t(
              "laboratoryApprovalConfigTitleHelpText",
              "Functional name of the approval"
            )}
            invalid={!!errors.approvalTitle}
            invalidText={errors.approvalTitle && errors?.approvalTitle?.message}
          />

          <ControlledTextInput
            readOnly={!canEdit}
            id="privilege"
            name="privilege"
            control={control}
            controllerName="privilege"
            maxLength={255}
            size={"md"}
            value={`${model?.privilege ?? ""}`}
            labelText={t("laboratoryApprovalConfigPrivilege", "Privilege:")}
            helperText={t(
              "laboratoryApprovalConfigPrivilegeHelpText",
              "OpenMRS privilege name. Users with a role that has this privilege will be the ones able to approve."
            )}
            invalid={!!errors.privilege}
            invalidText={errors.privilege && errors?.privilege?.message}
          />

          <ControlledTextInput
            readOnly={!canEdit}
            id="pendingStatus"
            name="pendingStatus"
            control={control}
            controllerName="pendingStatus"
            maxLength={100}
            size={"md"}
            value={`${model?.pendingStatus ?? ""}`}
            labelText={t(
              "laboratoryApprovalConfigPendingStatus",
              "Pending Status:"
            )}
            helperText={t(
              "laboratoryApprovalConfigPendingStatusHelpText",
              "e.g. Pending Approval"
            )}
            invalid={!!errors.pendingStatus}
            invalidText={errors.pendingStatus && errors?.pendingStatus?.message}
          />

          <ControlledTextInput
            readOnly={!canEdit}
            id="returnedStatus"
            name="returnedStatus"
            control={control}
            controllerName="returnedStatus"
            maxLength={100}
            size={"md"}
            value={`${model?.returnedStatus ?? ""}`}
            labelText={t(
              "laboratoryApprovalConfigReturnedStatus",
              "Returned Status:"
            )}
            helperText={t(
              "laboratoryApprovalConfigReturnedStatusHelpText",
              "e.g. Returned By Supervisor"
            )}
            invalid={!!errors.returnedStatus}
            invalidText={
              errors.returnedStatus && errors?.returnedStatus?.message
            }
          />

          <ControlledTextInput
            readOnly={!canEdit}
            id="rejectedStatus"
            name="rejectedStatus"
            control={control}
            controllerName="rejectedStatus"
            maxLength={100}
            size={"md"}
            value={`${model?.rejectedStatus ?? ""}`}
            labelText={t(
              "laboratoryApprovalConfigRejectedStatus",
              "Rejected Status:"
            )}
            helperText={t(
              "laboratoryApprovalConfigRejectedStatusHelpText",
              "e.g. Rejected By Supervisor"
            )}
            invalid={!!errors.rejectedStatus}
            invalidText={
              errors.rejectedStatus && errors?.rejectedStatus?.message
            }
          />

          <ControlledTextInput
            readOnly={!canEdit}
            id="approvedStatus"
            name="approvedStatus"
            control={control}
            controllerName="approvedStatus"
            maxLength={100}
            size={"md"}
            value={`${model?.approvedStatus ?? ""}`}
            labelText={t(
              "laboratoryApprovalConfigApprovedStatus",
              "Approved Status:"
            )}
            helperText={t(
              "laboratoryApprovalConfigApprovedStatusHelpText",
              "e.g. Approved"
            )}
            invalid={!!errors.approvedStatus}
            invalidText={
              errors.approvedStatus && errors?.approvedStatus?.message
            }
          />
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

export default ApprovalConfigForm;
