import React, { ChangeEvent } from "react";
import styles from "./result-form.scss";
import { TextInput, Select, SelectItem } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { Controller, useFieldArray } from "react-hook-form";
import { printValueRange, ResultField } from "./result-field";
import { Concept } from "../api/types/concept/concept";

interface InlineResultPanelFormFieldProps<T> {
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
}

const InlineResultPanelFormField = <T,>({
  concept,
  control,
  errors,
  isPanel,
  isCoded,
  isTextOrNumeric,
  controllerName,
  hideLabel,
  rowIndex,
}: InlineResultPanelFormFieldProps<T>) => {
  const { t } = useTranslation();

  const { fields } = useFieldArray({
    control,
    name: controllerName,
  });

  return (
    <>
      {fields.map((member, index) => {
        let memberField = member as any as ResultField;
        if (memberField.isTextOrNumeric) {
          return (
            <Controller
              key={member.id}
              control={control}
              name={`${controllerName}.${index}.value`}
              render={({ field }) => (
                <TextInput
                  key={memberField.concept.uuid}
                  {...field}
                  className={styles.textInput}
                  type={"text"}
                  hideLabel={hideLabel}
                  placeholder={
                    memberField.concept?.datatype?.display === "Numeric"
                      ? printValueRange(
                          memberField.concept,
                          memberField.concept?.allowDecimal ?? true
                            ? "Decimal Number"
                            : "Whole Number"
                        ) ?? ""
                      : ""
                  }
                  labelText={
                    memberField.concept?.display +
                    (memberField.concept.datatype.display === "Numeric"
                      ? printValueRange(memberField.concept) ?? ""
                      : "")
                  }
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    field.onChange(e.target.value);
                  }}
                  invalid={
                    errors?.worksheetItems?.[rowIndex]?.setMembers?.[index]
                      ?.value
                  }
                  invalidText={
                    errors?.worksheetItems?.[rowIndex]?.setMembers?.[index]
                      ?.value?.message
                  }
                />
              )}
            />
          );
        }

        if (memberField.isCoded) {
          return (
            <Controller
              name={`${controllerName}.${index}.value`}
              key={member.id}
              control={control}
              render={({ field }) => (
                <Select
                  key={memberField.concept.uuid}
                  {...field}
                  className={styles.textInput}
                  type="text"
                  hideLabel={hideLabel}
                  labelText={memberField.concept?.display}
                  onChange={(evt: ChangeEvent<HTMLSelectElement>) => {
                    field.onChange(evt.target.value);
                  }}
                  invalid={
                    errors?.worksheetItems?.[rowIndex]?.setMembers?.[index]
                      ?.value
                  }
                  invalidText={
                    errors?.worksheetItems?.[rowIndex]?.setMembers?.[index]
                      ?.value?.message
                  }
                >
                  <SelectItem text={t("option", "Choose an Option")} value="" />

                  {memberField.concept?.answers?.map((answer) => (
                    <SelectItem
                      key={answer.uuid}
                      text={answer.display}
                      value={answer.uuid}
                    >
                      {answer.display}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          );
        }
      })}
    </>
  );
};

export default InlineResultPanelFormField;
