import React, { useEffect, useState } from "react";
import { RadioButtonGroupProps } from "@carbon/react/lib/components/RadioButtonGroup/RadioButtonGroup";
import { Control, Controller, FieldValues } from "react-hook-form";
import {
  RadioButtonGroup,
  RadioButton,
  TextInputSkeleton,
} from "@carbon/react";
import { useCareSettings } from "../../api/care-setting.resource";
import styles from "./care-setting-selector-radio-button-group.component.scss";
import { useLazyVisits } from "../../api/visit.resource";
import { ResourceRepresentation } from "../../api/resource-filter-criteria";

interface CareSettingRadioButtonGroupProps<T> extends RadioButtonGroupProps {
  controllerName: string;
  defaultSelected?: any;
  name: string;
  control: Control<FieldValues, T>;
  preselectForPatientUuid?: string;
  labelText?: string;
  invalid?: boolean;
  invalidText?: string;
  onChange: (selection: string, name?: string, event?: unknown) => void;
  onRequestChange?: (selection: string, name?: string) => void;
}

const CareSettingRadioButtonGroup = <T,>(
  props: CareSettingRadioButtonGroupProps<T>
) => {
  const [stateKey, setStateKey] = useState(1);
  const {
    items: { results: careSettingOptions },
    isLoading,
  } = useCareSettings({});

  const {
    items: { results: visits },
    getVisits,
  } = useLazyVisits();

  const {
    defaultSelected,
    preselectForPatientUuid,
    control,
    name,
    onRequestChange,
  } = props;

  useEffect(() => {
    if (preselectForPatientUuid && !defaultSelected) {
      getVisits({
        patient: preselectForPatientUuid,
        includeInactive: false,
        v: ResourceRepresentation.Default,
      });
    }
  }, [getVisits, defaultSelected, preselectForPatientUuid]);

  useEffect(() => {
    if (
      stateKey == 1 &&
      careSettingOptions &&
      visits &&
      onRequestChange &&
      control &&
      name &&
      !control._formValues[name]
    ) {
      let currentVisit =
        visits?.find((visit) => visit.stopDatetime === null) ?? null;
      if (currentVisit && currentVisit.location) {
        let locationCareSetting: string = null;
        if (currentVisit.location.display) {
          let lowerLocationName = currentVisit.location.display.toLowerCase();
          if (lowerLocationName.indexOf("patient") > -1) {
            if (lowerLocationName.indexOf("out") > -1) {
              locationCareSetting = "out";
            } else if (lowerLocationName.indexOf("in") > -1) {
              locationCareSetting = "in";
            }
          }
        }
        if (!locationCareSetting && currentVisit.location.name) {
          let lowerLocationName = currentVisit.location.name.toLowerCase();
          if (lowerLocationName.indexOf("patient") > -1) {
            if (lowerLocationName.indexOf("out") > -1) {
              locationCareSetting = "out";
            } else if (lowerLocationName.indexOf("in") > -1) {
              locationCareSetting = "in";
            }
          }
        }
        if (locationCareSetting) {
          let careSettingOption = careSettingOptions?.find((p) => {
            let careSettingName = p.display?.toLowerCase();
            let tokenIndex = careSettingName.indexOf(locationCareSetting);
            return (
              tokenIndex > -1 && tokenIndex < careSettingName.indexOf("patient")
            );
          });
          if (careSettingOption && onRequestChange) {
            onRequestChange(careSettingOption.uuid);
            setStateKey(stateKey + 1);
          }
        }
      }
    }
  }, [careSettingOptions, onRequestChange, control, name, visits, stateKey]);

  if (isLoading) return <TextInputSkeleton />;
  return (
    <div className={styles.horizontalRadioButtons}>
      <div className={`${styles.radioLabel} cds--label`}>
        {props.labelText}
        {props.invalid && props.invalidText && (
          <div className={styles.errorText}>{props.invalidText}</div>
        )}
      </div>
      <Controller
        name={props.controllerName}
        control={props.control}
        render={({ field: { onChange, value, ref } }) => (
          <RadioButtonGroup
            {...props}
            key={stateKey}
            onChange={(selection: string, name: string, event: unknown) => {
              onChange(selection, name, event);

              // Fire prop change
              if (props["onChange"]) {
                props["onChange"](selection, name, event);
              }
            }}
            id={props.name}
            ref={ref}
            defaultSelected={props.defaultSelected ?? value}
            value={value}
          >
            {careSettingOptions.map((option, index) => (
              <RadioButton
                key={`${index}-${props.name}-${option.uuid}`}
                id={`${props.name}-${option.uuid}`}
                labelText={option.display}
                value={option.uuid}
                checked={value === option.uuid}
                onChange={() => onChange(option.uuid)}
                ref={ref}
              />
            ))}
          </RadioButtonGroup>
        )}
      />
    </div>
  );
};

export default CareSettingRadioButtonGroup;
