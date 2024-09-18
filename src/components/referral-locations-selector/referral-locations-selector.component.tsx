import React, { ReactNode } from "react";
import { ReferrerLocation } from "../../api/types/referrer-location";
import { Control, Controller, FieldValues } from "react-hook-form";
import { ComboBox, TextInputSkeleton } from "@carbon/react";
import { useReferrerLocations } from "../../api/referrer-location.resource";

interface ReferrerLocationSelectorProps<T> {
  className?: string;
  selectedId?: string;
  selectedText?: string;
  onChange?: (unit: ReferrerLocation) => void;
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;
  referrerIn?: boolean;
  referrerOut?: boolean;

  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
  idSuffix?: string;
}

const ReferrerLocationSelector = <T,>(
  props: ReferrerLocationSelectorProps<T>
) => {
  const {
    items: { results: referrerLocationOptions },
    isLoading,
  } = useReferrerLocations({
    active: true,
    referrerIn: props.referrerIn,
    referrerOut: props.referrerOut,
  });

  if (isLoading) return <TextInputSkeleton />;

  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange } }) => (
        <ComboBox
          titleText={props.title}
          name={props.name}
          control={props.control}
          controllerName={props.controllerName}
          id={`${props.name}-${props.idSuffix}`}
          size="md"
          items={
            props.selectedId
              ? [
                  ...(referrerLocationOptions?.some(
                    (x) => x.uuid === props.selectedId
                  )
                    ? []
                    : [
                        {
                          uuid: props.selectedId,
                          display: props.selectedText,
                        },
                      ]),
                  ...(referrerLocationOptions ?? []),
                ]
              : referrerLocationOptions || []
          }
          onChange={(data: { selectedItem: ReferrerLocation }) => {
            props.onChange?.(data?.selectedItem);
            onChange(data?.selectedItem?.uuid);
          }}
          initialSelectedItem={
            props.selectedId
              ? referrerLocationOptions?.find(
                  (p) => p.uuid === props.selectedId
                ) ?? {
                  uuid: props.selectedId,
                  display: props.selectedText,
                }
              : null
          }
          itemToString={(item?: ReferrerLocation) =>
            item?.name ??
            item?.conceptName ??
            (item?.patientFamilyName || item?.patientGivenName
              ? `${item?.patientFamilyName} ${item?.patientMiddleName} ${item?.patientGivenName}`
              : "")
          }
          shouldFilterItem={() => true}
          placeholder={props.placeholder}
          invalid={props.invalid}
          invalidText={props.invalidText}
        />
      )}
    />
  );
};

export default ReferrerLocationSelector;
