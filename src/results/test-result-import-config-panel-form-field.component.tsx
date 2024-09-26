import React, { ChangeEvent } from "react";
import styles from "./result-form.scss";
import { TextInput, Select, SelectItem } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { Controller, useFieldArray, useWatch } from "react-hook-form";
import { ResultField } from "./result-field";
import { Concept } from "../api/types/concept/concept";
import {
  DO_NOT_FILL_VALUE,
  TestResultImportConfigMapping,
} from "../api/types/test-result-import-config";
import TestResultImportConfigPanelFieldAnswers from "./test-result-import-config-panel-field-answers.component";

interface TestResultImportConfigPanelFormFieldProps<T> {
  control: any;
  register: any;
  errors: any;
  controllerName: string;
  isCoded: boolean;
  isPanel: boolean;
  concept: Concept;
  isTextOrNumeric: boolean;
  hideLabel: boolean;
  rowIndex: number;
  testResultImportConfigMapping: TestResultImportConfigMapping;
  setValue: (fieldKey: string, value: any) => void;
}

const TestResultImportConfigPanelFormField = <T,>({
  concept,
  control,
  errors,
  isPanel,
  isCoded,
  isTextOrNumeric,
  controllerName,
  hideLabel,
  rowIndex,
  testResultImportConfigMapping,
  register,
  setValue,
}: TestResultImportConfigPanelFormFieldProps<T>) => {
  const { t } = useTranslation();

  const { fields } = useFieldArray({
    control,
    name: controllerName,
  });

  const setMemberData = useWatch<any>({
    name: controllerName,
    control,
  });

  return (
    <div className={`${styles.codedImportConfigValuesSection}`}>
      {fields.map((member, index) => {
        let memberField = member as any as ResultField;
        return (
          <div
            className={`${
              memberField?.concept?.datatype?.display === "Numeric" ||
              memberField.isCoded
                ? styles.codedImportConfigValues
                : ""
            }  ${styles.testImportFieldSection} `}
          >
            {(memberField.isTextOrNumeric || memberField.isCoded) && (
              <React.Fragment key={member.id}>
                <Controller
                  control={control}
                  name={`${controllerName}.${index}.value`}
                  render={({ field: { value: selectedValue, onChange } }) => {
                    const selectedHeaderValue =
                      testResultImportConfigMapping?.headers?.find(
                        (x) => x.name == selectedValue
                      )?.value;
                    return (
                      <>
                        <Select
                          key={memberField.concept.uuid}
                          value={selectedValue}
                          className={`${styles.textInput} ${styles.mainTestField}`}
                          type="text"
                          hideLabel={hideLabel}
                          labelText={memberField.concept?.display}
                          helperText={
                            selectedHeaderValue
                              ? `e.g. ${selectedHeaderValue}`
                              : ""
                          }
                          onChange={(evt: ChangeEvent<HTMLSelectElement>) => {
                            onChange(evt.target.value);
                            if (
                              evt.target.value &&
                              evt.target.value == DO_NOT_FILL_VALUE &&
                              memberField.isCoded
                            ) {
                              memberField?.answers?.forEach(
                                (item, itemIndex) => {
                                  setValue(
                                    `${controllerName}.${index}.answers.${itemIndex}.value`,
                                    DO_NOT_FILL_VALUE
                                  );
                                }
                              );
                            }
                          }}
                          invalid={
                            errors?.fields?.[rowIndex]?.setMembers?.[index]
                              ?.value
                          }
                          invalidText={
                            errors?.fields?.[rowIndex]?.setMembers?.[index]
                              ?.value?.message
                          }
                        >
                          <SelectItem
                            text={t(
                              "laboratoryTestResultsImportOption",
                              "Choose a field"
                            )}
                            value=""
                          />
                          <SelectItem
                            text={t(
                              "laboratoryTestResultsImportDoNotFillOption",
                              "DO NOT FILL"
                            )}
                            value={DO_NOT_FILL_VALUE}
                          />
                          {testResultImportConfigMapping?.headers?.map(
                            (answer) => (
                              <SelectItem
                                key={answer.name}
                                text={answer.name}
                                value={answer.name}
                              >
                                {answer.name}
                              </SelectItem>
                            )
                          )}
                        </Select>
                      </>
                    );
                  }}
                />
                {memberField?.concept?.datatype.display === "Numeric" && (
                  <Controller
                    key={memberField.id}
                    name={`${controllerName}.${index}.scale`}
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        className={styles.textInput}
                        {...field}
                        type={"text"}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          field.onChange(e.target.value);
                        }}
                        hideLabel={hideLabel}
                        placeholder={t("laboratoryTestImportScale", "Scale")}
                        helperText={t(
                          "laboratoryTestImportScaleDesc",
                          "The scale is used to convert the units to those supported by system"
                        )}
                        labelText={t(
                          "laboratoryTestImportScaleLbl",
                          "Scale e.g. 1, 0.5"
                        )}
                        invalid={
                          errors?.fields?.[rowIndex]?.setMembers?.[index]?.scale
                        }
                        invalidText={
                          errors?.fields?.[rowIndex]?.setMembers?.[index]?.scale
                            ?.message
                        }
                      />
                    )}
                  />
                )}
              </React.Fragment>
            )}

            {memberField.isCoded && (
              <div className={styles.codedImportConfigValuesSection}>
                <TestResultImportConfigPanelFieldAnswers
                  concept={memberField?.concept}
                  control={control}
                  errors={errors}
                  isPanel={memberField.isPanel}
                  isCoded={memberField.isCoded}
                  isTextOrNumeric={memberField.isTextOrNumeric}
                  controllerName={`${controllerName}.${index}.answers`}
                  register={register}
                  hideLabel={hideLabel}
                  rowIndex={rowIndex}
                  setMembersIndex={index}
                  testResultImportConfigMapping={testResultImportConfigMapping}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TestResultImportConfigPanelFormField;
