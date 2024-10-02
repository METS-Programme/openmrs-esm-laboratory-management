import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { Storage } from "../../api/types/storage";
import { Control, Controller, FieldValues } from "react-hook-form";
import { ComboBox, TextInputSkeleton } from "@carbon/react";
import { useLazyStorages } from "../../api/storage.resource";
import { ResourceRepresentation } from "../../api/resource-filter-criteria";
import debounce from "lodash-es/debounce";

interface ControlledStorageSelectorProps<T> {
  className?: string;
  selectedId?: string;
  selectedText?: string;
  active?: boolean;
  onChange?: (unit: Storage) => void;
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;
  name: string;
  idSuffix?: string;
  hideLabel?: boolean;
  style?: any;
  // Control
  controllerName: string;
  control: Control<FieldValues, T>;
  excludeOptions?: string[];
  direction?: "top" | "bottom";
  displayLabSection?: boolean;
}

const ControlledStorageSelector = <T,>(
  props: ControlledStorageSelectorProps<T>
) => {
  const [inputValue, setInputValue] = useState("");
  const {
    items: { results: StorageOptions },
    isValidating,
    loaded,
    getStorages,
  } = useLazyStorages({
    limit: 10,
    v: ResourceRepresentation.Default,
    active: props.active,
  });

  useEffect(() => {
    getStorages({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStorageSearch = useMemo(
    () =>
      debounce((searchTerm) => {
        getStorages({
          q: searchTerm,
          startIndex: 0,
          limit: 10,
          active: props.active,
        });
      }, 300),
    [getStorages, props.active]
  );

  const handleInputChange = (value) => {
    setInputValue(value);
    handleStorageSearch(value);
  };
  if (isValidating && !loaded) return <TextInputSkeleton />;

  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange } }) => (
        <ComboBox
          style={props.style}
          className={props.className}
          titleText={props.title}
          hideLabel={props.hideLabel}
          direction={props.direction}
          name={props.name}
          size="md"
          items={
            props.selectedId
              ? [
                  ...(StorageOptions?.some((x) => x.uuid === props.selectedId)
                    ? []
                    : [
                        {
                          uuid: props.selectedId,
                          display: props.selectedText,
                        },
                      ]),
                  ...(StorageOptions ?? []),
                ]
              : StorageOptions || []
          }
          onChange={(data: { selectedItem: Storage }) => {
            onChange(data?.selectedItem?.uuid);
            props.onChange?.(data?.selectedItem);
          }}
          initialSelectedItem={
            props.selectedId
              ? StorageOptions?.find((p) => p.uuid === props.selectedId) ?? {
                  uuid: props.selectedId,
                  display: props.selectedText,
                }
              : null
          }
          itemToString={(item?: Storage) =>
            item?.name
              ? `${item.name}${
                  item.atLocationName ? ` (${item.atLocationName})` : ""
                }`
              : ""
          }
          shouldFilterItem={() => true}
          placeholder={props.placeholder}
          onInputChange={(event) => handleInputChange(event)}
          inputValue={inputValue}
          invalid={props.invalid}
          invalidText={props.invalidText}
        />
      )}
    />
  );
};

export default ControlledStorageSelector;
