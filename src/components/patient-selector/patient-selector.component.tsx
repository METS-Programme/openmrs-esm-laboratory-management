import React, { ReactNode, useMemo, useState } from "react";
import { Patient } from "../../api/types/patient";
import { Control, Controller, FieldValues } from "react-hook-form";
import { useLazyPatients } from "../../api/patient.resource";
import { ComboBox, TextInputSkeleton } from "@carbon/react";
import debounce from "lodash-es/debounce";

interface PatientsSelectorProps<T> {
  patientUuid?: string;
  onPatientUuidChange?: (unit: Patient) => void;
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;
  selectedId?: string;
  selectedText?: string;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
}

const PatientsSelector = <T,>(props: PatientsSelectorProps<T>) => {
  const {
    items: { results: patients },
    isLoading,
    isValidating,
    getPatients,
  } = useLazyPatients();
  const [inputValue, setInputValue] = useState("");

  const handlePatientSearch = useMemo(
    () =>
      debounce((searchTerm) => {
        getPatients({
          q: searchTerm,
          startIndex: 0,
          limit: 10,
          includeDead: true,
          v: "custom:(patientId,uuid,display,patientIdentifier:(uuid,identifier),person:(gender,age,birthdate,display))",
        });
      }, 300),
    [getPatients]
  );

  const handleInputChange = (value) => {
    setInputValue(value);
    handlePatientSearch(value);
  };

  if (isLoading) return <TextInputSkeleton />;

  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange, ref } }) => (
        <ComboBox
          titleText={props.title}
          name={props.name}
          control={props.control}
          controllerName={props.controllerName}
          id={props.name}
          size={"md"}
          onChange={(data: { selectedItem: Patient }) => {
            props.onPatientUuidChange?.(data.selectedItem);
            onChange(data.selectedItem?.uuid);
          }}
          items={
            props.selectedId
              ? [
                  ...(patients?.some((x) => x.uuid === props.selectedId)
                    ? []
                    : [
                        {
                          uuid: props.selectedId,
                          display: props.selectedText,
                        },
                      ]),
                  ...(patients ?? []),
                ]
              : patients || []
          }
          initialSelectedItem={
            props.selectedId
              ? patients?.find((p) => p.uuid === props.selectedId) ?? {
                  uuid: props.selectedId,
                  display: props.selectedText,
                }
              : null
          }
          itemToString={(item?: Patient) =>
            item && item?.display
              ? `${item?.display}${
                  item?.person?.age || item?.person?.gender
                    ? ` (${item?.person?.age ?? ""}${
                        item?.person?.gender ?? ""
                      })`
                    : ""
                }`
              : ""
          }
          shouldFilterItem={() => true}
          onInputChange={(event) => handleInputChange(event)}
          inputValue={inputValue}
          placeholder={props.placeholder}
          ref={ref}
          invalid={props.invalid}
          invalidText={props.invalidText}
        />
      )}
    />
  );
};

export default PatientsSelector;
