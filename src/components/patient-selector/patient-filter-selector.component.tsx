import React, { ReactNode, useMemo, useState } from "react";
import { Patient } from "../../api/types/patient";
import { useLazyPatients } from "../../api/patient.resource";
import { ComboBox, TextInputSkeleton } from "@carbon/react";
import debounce from "lodash-es/debounce";

interface PatientsFilterSelectorProps<T> {
  patientUuid?: string;
  onPatientUuidChange?: (unit: Patient) => void;
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;
  selectedId?: string;
  selectedText?: string;
  name: string;
  className?: string;
}

const PatientsFilterSelector = <T,>(props: PatientsFilterSelectorProps<T>) => {
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
    <ComboBox
      className={props.className}
      titleText={props.title}
      name={props.name}
      id={props.name}
      size={"md"}
      onChange={(data: { selectedItem: Patient }) => {
        props.onPatientUuidChange?.(data.selectedItem);
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
                ? ` (${item?.person?.age ?? ""}${item?.person?.gender ?? ""})`
                : ""
            }`
          : ""
      }
      shouldFilterItem={() => true}
      onInputChange={(event) => handleInputChange(event)}
      inputValue={inputValue}
      placeholder={props.placeholder}
      invalid={props.invalid}
      invalidText={props.invalidText}
    />
  );
};

export default PatientsFilterSelector;
