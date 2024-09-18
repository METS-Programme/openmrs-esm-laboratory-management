import React, { ChangeEvent } from "react";
import styles from "./result-form.scss";
import { TextInput, Select, SelectItem } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { Controller, useFieldArray, useWatch } from "react-hook-form";
import TestResultImportConfigPanelFormField from "./test-result-import-config-panel-form-field.component";
import { printValueRange, ResultField } from "./result-field";
import { Concept } from "../api/types/concept/concept";
import {
  DO_NOT_FILL_VALUE,
  TestResultImportConfigMapping,
} from "../api/types/test-result-import-config";

interface TestResultImportConfigFormFieldProps {
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

const TestResultImportConfigFormField: React.FC<
  TestResultImportConfigFormFieldProps
> = ({
  concept,
  control,
  errors,
  isPanel,
  isCoded,
  isTextOrNumeric,
  controllerName,
  register,
  hideLabel,
  rowIndex,
  testResultImportConfigMapping,
  setValue,
}) => {
  const { t } = useTranslation();

  const { fields } = useFieldArray({
    control,
    name: `${controllerName}.answers`,
  });

  const memberData = useWatch<any>({
    name: controllerName,
    control,
  });

  return (
    <>
      {(isTextOrNumeric || isCoded) && (
        <div
          key={concept.uuid}
          className={
            concept.datatype.display === "Numeric" || isCoded
              ? styles.codedImportConfigValues
              : ""
          }
        >
          <Controller
            name={`${controllerName}.value`}
            control={control}
            render={({ field: { value: selectedValue, onChange } }) => {
              const selectedHeaderValue =
                testResultImportConfigMapping?.headers?.find(
                  (x) => x.name == selectedValue
                )?.value;
              return (
                <Select
                  value={selectedValue}
                  className={styles.textInput}
                  type="text"
                  hideLabel={hideLabel}
                  labelText={
                    concept?.display +
                    (concept.datatype.display === "Numeric"
                      ? printValueRange(concept) ?? ""
                      : "")
                  }
                  helperText={
                    selectedHeaderValue ? `e.g. ${selectedHeaderValue}` : ""
                  }
                  onChange={(evt: ChangeEvent<HTMLSelectElement>) => {
                    onChange(evt.target.value);

                    if (
                      evt.target.value &&
                      evt.target.value == DO_NOT_FILL_VALUE &&
                      isCoded
                    ) {
                      fields?.forEach((item, itemIndex) => {
                        setValue(
                          `${controllerName}.answers.${itemIndex}.value`,
                          DO_NOT_FILL_VALUE
                        );
                      });
                    }
                  }}
                  invalid={errors?.fields?.[rowIndex]?.value}
                  invalidText={errors?.fields?.[rowIndex]?.value?.message}
                >
                  <SelectItem
                    text={t(
                      "laboratoryTestResultsImportOption",
                      "Choose field"
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

                  {testResultImportConfigMapping?.headers?.map((answer) => (
                    <SelectItem
                      key={answer.name}
                      text={answer.name}
                      value={answer.name}
                    >
                      {answer.name}
                    </SelectItem>
                  ))}
                </Select>
              );
            }}
          />
          {concept.datatype.display === "Numeric" && (
            <Controller
              key={concept.uuid}
              name={`${controllerName}.scale`}
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
                  invalid={errors?.fields?.[rowIndex]?.scale}
                  invalidText={errors?.fields?.[rowIndex]?.scale?.message}
                />
              )}
            />
          )}
        </div>
      )}

      {isCoded && (
        <div>
          <div className={styles.codedImportConfigValues}>
            {fields?.map((answerField, index) => {
              let answer = answerField as any as ResultField;
              return (
                <Controller
                  key={answer.concept.uuid}
                  name={`${controllerName}.answers.${index}.value`}
                  control={control}
                  render={({ field: { value: selectedValue, onChange } }) => {
                    return (
                      <>
                        <TextInput
                          className={`${styles.textInput} ${styles.mainTestField}`}
                          value={selectedValue}
                          type={"text"}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            onChange(e.target.value);
                          }}
                          hideLabel={hideLabel}
                          placeholder={t(
                            "laboratoryTestImportCodedValue",
                            "Machine Output"
                          )}
                          labelText={`Value: ${answer?.concept?.display}`}
                          invalid={
                            errors?.fields?.[rowIndex]?.answers?.[index]?.value
                          }
                          invalidText={
                            errors?.fields?.[rowIndex]?.answers?.[index]?.value
                              ?.message
                          }
                        />
                      </>
                    );
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {isPanel && (
        <TestResultImportConfigPanelFormField
          concept={concept}
          control={control}
          errors={errors}
          isPanel={isPanel}
          isCoded={isCoded}
          isTextOrNumeric={isTextOrNumeric}
          controllerName={`${controllerName}.setMembers`}
          register={register}
          hideLabel={hideLabel}
          rowIndex={rowIndex}
          setValue={setValue}
          testResultImportConfigMapping={testResultImportConfigMapping}
        />
      )}
    </>
  );
};

export default TestResultImportConfigFormField;
