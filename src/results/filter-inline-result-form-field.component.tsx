import React, { ChangeEvent } from "react";
import styles from "./result-form.scss";
import { TextInput, Select, SelectItem } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import FilterInlineResultPanelFormField from "./filter-inline-result-panel-form-field.component";
import { printValueRange } from "./result-field";
import { Concept } from "../api/types/concept/concept";

interface FilterInlineResultFormFieldProps {
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

const FilterInlineResultFormField: React.FC<
  FilterInlineResultFormFieldProps
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
}) => {
  const { t } = useTranslation();

  return (
    <>
      {isTextOrNumeric && (
        <>
          {concept.datatype.display === "Numeric" ? (
            <div>
              <label className="cds--label">
                {concept?.display +
                  (concept.datatype.display === "Numeric"
                    ? printValueRange(concept, "") ?? ""
                    : "")}
              </label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Controller
                  key={concept.uuid}
                  name={`${controllerName}.minValue`}
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
                      placeholder={
                        concept.datatype.display === "Numeric"
                          ? printValueRange(
                              concept,
                              concept.allowDecimal ?? true
                                ? "Decimal #"
                                : "Whole #"
                            ) ?? ""
                          : ""
                      }
                      labelText={"Min"}
                      invalid={errors?.testOutcomes?.[rowIndex]?.value}
                      invalidText={
                        errors?.testOutcomes?.[rowIndex]?.value?.message
                      }
                    />
                  )}
                />
                <Controller
                  key={concept.uuid}
                  name={`${controllerName}.maxValue`}
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
                      placeholder={
                        concept.datatype.display === "Numeric"
                          ? printValueRange(
                              concept,
                              concept.allowDecimal ?? true
                                ? "Decimal #"
                                : "Whole #"
                            ) ?? ""
                          : ""
                      }
                      labelText={"Max"}
                      invalid={errors?.testOutcomes?.[rowIndex]?.value}
                      invalidText={
                        errors?.testOutcomes?.[rowIndex]?.value?.message
                      }
                    />
                  )}
                />
              </div>
            </div>
          ) : (
            <Controller
              key={concept.uuid}
              name={`${controllerName}.value`}
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
                  placeholder={""}
                  labelText={
                    concept?.display +
                    (concept.datatype.display === "Numeric"
                      ? printValueRange(concept) ?? ""
                      : "")
                  }
                  invalid={errors?.testOutcomes?.[rowIndex]?.value}
                  invalidText={errors?.testOutcomes?.[rowIndex]?.value?.message}
                />
              )}
            />
          )}
        </>
      )}

      {isCoded && (
        <Controller
          key={concept.uuid}
          name={`${controllerName}.value`}
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              className={styles.textInput}
              type="text"
              hideLabel={hideLabel}
              labelText={concept?.display}
              onChange={(evt: ChangeEvent<HTMLSelectElement>) => {
                field.onChange(evt.target.value);
              }}
              invalid={errors?.testOutcomes?.[rowIndex]?.value}
              invalidText={errors?.testOutcomes?.[rowIndex]?.value?.message}
            >
              <SelectItem text={t("option", "Choose an Option")} value="" />

              {concept?.answers?.map((answer) => (
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
      )}

      {isPanel && (
        <FilterInlineResultPanelFormField
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
        />
      )}
    </>
  );
};

export default FilterInlineResultFormField;
