import React, { ChangeEvent } from "react";
import styles from "./result-form.scss";
import { TextInput } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { Controller, useFieldArray } from "react-hook-form";
import { ResultField } from "./result-field";
import { Concept } from "../api/types/concept/concept";
import { TestResultImportConfigMapping } from "../api/types/test-result-import-config";

interface TestResultImportConfigPanelFieldAnswersProps<T> {
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
  setMembersIndex: number;
  testResultImportConfigMapping: TestResultImportConfigMapping;
}

const TestResultImportConfigPanelFieldAnswers = <T,>({
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
  setMembersIndex,
}: TestResultImportConfigPanelFieldAnswersProps<T>) => {
  const { t } = useTranslation();

  const { fields } = useFieldArray({
    control,
    name: controllerName,
  });

  return (
    <div className={styles.codedImportConfigValues}>
      {fields.map((answerField, index) => {
        let answer = answerField as any as ResultField;
        return (
          <Controller
            key={answer.concept.uuid}
            name={`${controllerName}.${index}.value`}
            control={control}
            render={({ field: { value: selectedValue, onChange } }) => {
              return (
                <>
                  <TextInput
                    className={styles.textInput}
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
                      errors?.fields?.[rowIndex]?.setMembers?.[setMembersIndex]
                        ?.answers?.[index]?.value
                    }
                    invalidText={
                      errors?.fields?.[rowIndex]?.setMembers?.[setMembersIndex]
                        ?.answers?.[index]?.value?.message
                    }
                  />
                </>
              );
            }}
          />
        );
      })}
    </div>
  );
};

export default TestResultImportConfigPanelFieldAnswers;
