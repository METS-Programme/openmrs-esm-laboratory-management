import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { Storage } from "../../api/types/storage";
import { Control, Controller, FieldValues } from "react-hook-form";
import { ComboBox, TextInputSkeleton } from "@carbon/react";
import { useLazyStorages, useStorages } from "../../api/storage.resource";
import { ResourceRepresentation } from "../../api/resource-filter-criteria";
import debounce from "lodash-es/debounce";

interface StorageSelectorProps<T> {
  className?: string;
  selectedId?: string;
  selectedText?: string;
  onChange?: (unit: Storage) => void;
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;
  name: string;
  idSuffix?: string;
  hideLabel?: boolean;
  style?: any;
  displayLabSection?: boolean;
}

const StorageSelector = <T,>(props: StorageSelectorProps<T>) => {
  const [inputValue, setInputValue] = useState("");
  const {
    items: { results: StorageOptions },
    isValidating,
    loaded,
    getStorages,
  } = useLazyStorages({ limit: 10, v: ResourceRepresentation.Default });

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
        });
      }, 300),
    [getStorages]
  );

  const handleInputChange = (value) => {
    setInputValue(value);
    handleStorageSearch(value);
  };
  if (isValidating && !loaded) return <TextInputSkeleton />;

  return (
    <ComboBox
      style={props.style}
      titleText={props.title}
      hideLabel={props.hideLabel}
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
              props.displayLabSection ? ` (${item.atLocationName})` : ""
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
  );
};

export default StorageSelector;
