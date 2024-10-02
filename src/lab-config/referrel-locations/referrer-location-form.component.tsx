import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./referrer-location-form.component.scss";
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
  useSession,
  userHasAccess,
} from "@openmrs/esm-framework";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ReferrerLocation,
  enabledOptions,
} from "../../api/types/referrer-location";
import {
  ReferrerLocationFormData,
  referrerLocationSchema,
} from "./referrer-location-validation-schema";
import ControlledTextInput from "../../components/controlled-text-input/controlled-text-input.component";
import ControlledRadioButtonGroup from "../../components/controlled-radio-button-group/controlled-radio-button-group.component";
import { TASK_LABMANAGEMENT_TESTCONFIGURATIONS_MUTATE } from "../../config/privileges";

import {
  createReferrerLocation,
  updateReferrerLocation,
} from "../../api/referrer-location.resource";
import ConceptMembersSelector from "../../components/concepts-selector/concept-members-selector.component";
import { URL_API_REFERRER_LOCATION } from "../../config/urls";
import { handleMutate } from "../../api/swr-revalidation";
import PatientHeaderInfo from "../../components/patient-header-info/patient-header-info.component";
import { RadioOption } from "../../api/types/radio-option";
import { useLaboratoryConfig } from "../../hooks/useLaboratoryConfig";

interface ReferrerLocationFormProps {
  model?: ReferrerLocation;
}

const FacilityNameOptions: RadioOption[] = [
  { label: "Concept", value: true },
  { label: "Manual", value: false },
];

const ReferrerLocationForm: React.FC<ReferrerLocationFormProps> = ({
  model,
}) => {
  const { t } = useTranslation();
  const userSession = useSession();
  const [isNew] = useState(!Boolean(model?.uuid));
  const [canEdit, setCanEdit] = useState(isNew);
  const [canEditAllFields, setCanEditAllFieds] = useState(isNew);
  const {
    laboratoryConfig: {
      laboratoryTestGroupConcept,
      laboratoryReferalDestinationUuid,
      laboratoryOtherReferenceLabConcept,
    },
  } = useLaboratoryConfig();

  useEffect(
    () => {
      let editPerm =
        userSession?.user &&
        userHasAccess(
          TASK_LABMANAGEMENT_TESTCONFIGURATIONS_MUTATE,
          userSession.user
        );
      setCanEdit(editPerm);
      setCanEditAllFieds(editPerm && (isNew || !model.system));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const { handleSubmit, control, formState, watch, setValue } =
    useForm<ReferrerLocationFormData>({
      defaultValues: {
        ...model,
        ...{ useConcept: Boolean(model?.conceptUuid) },
      },
      mode: "all",
      resolver: zodResolver(referrerLocationSchema),
    });

  const { errors } = formState;
  const handleSave = async (item: any) => {
    try {
      setIsSaving(true);
      let itemToUse = {
        ...item,
        ...{
          name: item.useConcept ? null : item.name,
          conceptUuid: item.useConcept ? item.conceptUuid : null,
        },
      };
      const response: FetchResponse<ReferrerLocation> = await (isNew
        ? createReferrerLocation
        : updateReferrerLocation)(itemToUse);

      handleMutate(URL_API_REFERRER_LOCATION);

      if (response?.data) {
        showSnackbar({
          isLowContrast: true,
          title: isNew
            ? t("laboratoryAddReferrerLocationuration", "Add Referrel Locaton")
            : t(
                "laboratoryEditReferrerLocationuration",
                "Edit Referrel Locaton"
              ),
          kind: "success",
          subtitle: isNew
            ? t(
                "laboratoryAddReferrerLocationurationSuccess",
                "Referrel Locaton Added Successfully"
              )
            : t(
                "laboratoryEditReferrerLocationurationSuccess",
                "Referrel Locaton Edited Successfully"
              ),
        });

        closeOverlay();
      }
    } catch (error) {
      setIsSaving(false);
      showNotification({
        title: isNew
          ? t(
              "laboratoryAddReferrerLocationurationError",
              "Error adding a test configuration"
            )
          : t(
              "laboratoryEditReferrerLocationurationError",
              "Error editing a test configuration"
            ),
        kind: "error",
        critical: true,
        description: error?.responseBody?.error?.message,
      });
    }
  };

  const onSelectPatient = useCallback(
    (patientUuid: string) => {
      setValue("patientUuid", patientUuid);
    },
    [setValue]
  );

  const patientSearchState = useMemo(() => {
    return {
      selectPatientAction: onSelectPatient,
      initialSearchTerm: "",
    };
  }, [onSelectPatient]);

  const [isSaving, setIsSaving] = useState(false);
  const referrerIn = watch("referrerIn", model?.referrerIn);
  const useConcept = watch("useConcept", Boolean(model?.conceptUuid));
  const patientUuid = watch("patientUuid", model?.patientUuid);

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
          {/* <div className={styles.errorText}>
            {Object.entries(errors).map(([key, error]) => (
              <div>
                {key}:{error.message}
              </div>
            ))}
          </div> */}
          <div className={styles.referOptions}>
            {canEditAllFields && (
              <>
                <FormGroup
                  className="clear-margin-bottom"
                  legendText={t(
                    "laboratoryReferrerLocationAllowFromLocation",
                    "Allow referrals from location?:"
                  )}
                  title={t(
                    "laboratoryReferrerLocationAllowFromLocation",
                    "Allow referrals from location?:"
                  )}
                >
                  <ControlledRadioButtonGroup
                    control={control}
                    name="referrerIn"
                    defaultSelected={model.referrerIn}
                    controllerName="referrerIn"
                    legendText=""
                    invalid={!!errors.referrerIn}
                    onChange={(e) => {}}
                    invalidText={
                      errors.referrerIn && errors?.referrerIn?.message
                    }
                    options={enabledOptions}
                  />
                </FormGroup>
                {errors.referrerIn && errors?.referrerIn?.message && (
                  <div className={styles.errorText}>
                    {t(errors?.referrerIn?.message)}
                  </div>
                )}
              </>
            )}

            {!canEditAllFields && (
              <TextInput
                value={model.referrerIn ? t("yes", "Yes") : t("no", "No")}
                readOnly={true}
                labelText={t(
                  "laboratoryReferrerLocationAllowFromLocation",
                  "Allow referrals from location?:"
                )}
              />
            )}

            {canEditAllFields && (
              <>
                <FormGroup
                  className="clear-margin-bottom"
                  legendText={t(
                    "laboratoryReferrerLocationAllowFromLocation",
                    "Allow referrals to location?:"
                  )}
                  title={t(
                    "laboratoryReferrerLocationAllowFromLocation",
                    "Allow referrals to location?:"
                  )}
                >
                  <ControlledRadioButtonGroup
                    control={control}
                    name="referrerOut"
                    defaultSelected={model.referrerOut}
                    controllerName="referrerOut"
                    legendText=""
                    invalid={!!errors.referrerOut}
                    onChange={(e) => {}}
                    invalidText={
                      errors.referrerOut && errors?.referrerOut?.message
                    }
                    options={enabledOptions}
                  />
                </FormGroup>
                {errors.referrerOut && errors?.referrerOut?.message && (
                  <div className={styles.errorText}>
                    {t(errors?.referrerOut?.message)}
                  </div>
                )}
              </>
            )}

            {!canEditAllFields && (
              <TextInput
                value={model.referrerOut ? t("yes", "Yes") : t("no", "No")}
                readOnly={true}
                labelText={t(
                  "laboratoryReferrerLocationAllowFromLocation",
                  "Allow referrals to location?:"
                )}
              />
            )}
          </div>

          {canEditAllFields && (
            <>
              <FormGroup
                className="clear-margin-bottom"
                legendText={t(
                  "laboratoryReferrerLocationFacilityNameSource",
                  "Facility name source?:"
                )}
                title={t(
                  "laboratoryReferrerLocationFacilityNameSource",
                  "Facility name source?:"
                )}
              >
                <ControlledRadioButtonGroup
                  control={control}
                  name="useConcept"
                  defaultSelected={model?.conceptUuid ? true : false}
                  controllerName="useConcept"
                  legendText=""
                  invalid={!!errors.useConcept}
                  onChange={(e) => {}}
                  invalidText={errors.useConcept && errors?.useConcept?.message}
                  options={FacilityNameOptions}
                />
              </FormGroup>
              {errors.useConcept && errors?.useConcept?.message && (
                <div className={styles.errorText}>
                  {t(errors?.useConcept?.message)}
                </div>
              )}
            </>
          )}

          {!canEditAllFields && (
            <TextInput
              value={model.referrerIn ? t("yes", "Yes") : t("no", "No")}
              readOnly={true}
              labelText={t(
                "laboratoryReferrerLocationAllowFromLocation",
                "Allow referrals from location?:"
              )}
            />
          )}

          {useConcept && (
            <>
              {canEditAllFields && (
                <ConceptMembersSelector
                  conceptUuid={laboratoryReferalDestinationUuid}
                  selectedId={model?.conceptUuid}
                  selectedText={model?.conceptName}
                  controllerName={"conceptUuid"}
                  name="conceptUuid"
                  control={control}
                  title={t(
                    "locationReferralConcept",
                    "Referral Location Concept:"
                  )}
                  placeholder={t("chooseAnItem", "Choose an item")}
                  invalid={!!errors.conceptUuid}
                  excludeOptions={[laboratoryOtherReferenceLabConcept]}
                  invalidText={
                    errors.conceptUuid && errors?.conceptUuid?.message
                  }
                />
              )}

              {!canEditAllFields && (
                <TextInput
                  value={model.conceptName}
                  readOnly={true}
                  labelText={t(
                    "locationReferralConcept",
                    "Referral Location Concept:"
                  )}
                />
              )}
            </>
          )}
          {!useConcept && (
            <ControlledTextInput
              readOnly={!canEditAllFields}
              id="name"
              name="name"
              control={control}
              controllerName="name"
              maxLength={250}
              size={"md"}
              value={`${model?.name ?? ""}`}
              labelText={t("laboratoryReferralLocationName", "Facility Name:")}
              invalid={!!errors.name}
              invalidText={errors.name && errors?.name?.message}
            />
          )}

          <ControlledTextInput
            readOnly={!canEditAllFields}
            id="acronym"
            name="acronym"
            control={control}
            controllerName="acronym"
            maxLength={250}
            size={"md"}
            value={`${model?.acronym ?? ""}`}
            labelText={t("laboratoryReferralLocationAcronym", "Acronym:")}
            invalid={!!errors.acronym}
            invalidText={errors.acronym && errors?.acronym?.message}
          />

          {referrerIn && (
            <>
              {canEditAllFields && (
                <div className={styles.patientSearch}>
                  <div className="cds-label">
                    {t(
                      "laboratoryReferralLocationPatientHelperText",
                      "Reference location patient record to be associated with laboratory orders"
                    )}
                  </div>

                  <ExtensionSlot
                    name="patient-search-bar-slot"
                    state={patientSearchState}
                  />
                </div>
              )}
              {patientUuid && (
                <PatientHeaderInfo
                  key={patientUuid}
                  patientUuid={patientUuid}
                />
              )}
              {errors.patientUuid && errors?.patientUuid?.message && (
                <div className={styles.errorText}>
                  {t(errors?.patientUuid?.message)}
                </div>
              )}
            </>
          )}

          {canEdit && (
            <>
              <FormGroup
                className="clear-margin-bottom"
                legendText={t(
                  "laboratoryReferrerLocationEnableFacility",
                  "Enable Facility?:"
                )}
                title={t(
                  "laboratoryReferrerLocationEnableFacility",
                  "Enable Facility?:"
                )}
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
                  options={enabledOptions}
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
              labelText={t(
                "laboratoryReferrerLocationEnableFacility",
                "Enable Facility?:"
              )}
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

export default ReferrerLocationForm;
