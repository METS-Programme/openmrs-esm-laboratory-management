import React, { ReactNode, useMemo, useState } from "react";
import { OpenMRSLocation } from "../../api/types/location";
import { Control, Controller, FieldValues } from "react-hook-form";
import { useLazyOpenMRSLocations } from "../../api/location.resource";
import { ComboBox, TextInputSkeleton } from "@carbon/react";
import debounce from "lodash-es/debounce";
import { ResourceRepresentation } from "../../api/resource-filter-criteria";

interface LocationsSelectorProps<T> {
  locationUuid?: string;
  onLocationUuidChange?: (unit: OpenMRSLocation) => void;
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

const LocationsSelector = <T,>(props: LocationsSelectorProps<T>) => {
  const {
    items: { results: locations },
    isLoading,
    isValidating,
    getOpenMRSLocations,
  } = useLazyOpenMRSLocations();
  const [inputValue, setInputValue] = useState("");

  const handleLocationSearch = useMemo(
    () =>
      debounce((searchTerm) => {
        getOpenMRSLocations({
          q: searchTerm,
          startIndex: 0,
          limit: 10,
          v: ResourceRepresentation.Default,
        });
      }, 300),
    [getOpenMRSLocations]
  );

  const handleInputChange = (value) => {
    setInputValue(value);
    handleLocationSearch(value);
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
          onChange={(data: { selectedItem: OpenMRSLocation }) => {
            props.onLocationUuidChange?.(data.selectedItem);
            onChange(data.selectedItem?.uuid);
          }}
          items={
            props.selectedId
              ? [
                  ...(locations?.some((x) => x.uuid === props.selectedId)
                    ? []
                    : [
                        {
                          uuid: props.selectedId,
                          display: props.selectedText,
                        },
                      ]),
                  ...(locations ?? []),
                ]
              : locations || []
          }
          initialSelectedItem={
            props.selectedId
              ? locations?.find((p) => p.uuid === props.selectedId) ?? {
                  uuid: props.selectedId,
                  display: props.selectedText,
                }
              : null
          }
          itemToString={(item?: OpenMRSLocation) => item?.display ?? ""}
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

export default LocationsSelector;
