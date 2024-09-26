import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Storage, StorageUnit } from "../../api/types/storage";
import { Control, Controller, FieldValues } from "react-hook-form";
import { ComboBox, TextInputSkeleton } from "@carbon/react";
import { useLazyStorageUnits } from "../../api/storage.resource";
import { ResourceRepresentation } from "../../api/resource-filter-criteria";
import debounce from "lodash-es/debounce";

interface ControlledStorageUnitSelectorProps<T> {
  className?: string;
  storageUuid?: string;
  assigned?: boolean;
  active?: boolean;
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
  // Control
  controllerName: string;
  control: Control<FieldValues, T>;
  excludeOptions?: string[];
  direction?: "top" | "bottom";
}

const ControlledStorageUnitSelector = <T,>(
  props: ControlledStorageUnitSelectorProps<T>
) => {
  const [inputValue, setInputValue] = useState("");
  const {
    items: { results: StorageOptions },
    isValidating,
    loaded,
    getStorageUnits,
  } = useLazyStorageUnits({
    limit: 10,
    v: ResourceRepresentation.Default,
    assigned: props.assigned,
    active: props.active,
    storage: props.storageUuid,
  });

  const loadStorageUnits = useCallback(
    (searchTerm: string) => {
      if (props.storageUuid) {
        getStorageUnits({
          q: searchTerm,
          startIndex: 0,
          limit: 10,
          storage: props.storageUuid,
          active: props.active,
          assigned: props.assigned,
        });
      }
    },
    [getStorageUnits, props.active, props.assigned, props.storageUuid]
  );

  useEffect(() => {
    loadStorageUnits(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStorageSearch = useMemo(
    () =>
      debounce((searchTerm) => {
        loadStorageUnits(searchTerm);
      }, 300),
    [loadStorageUnits]
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
          key={props.storageUuid ?? "storageUnits"}
          style={props.style}
          titleText={props.title}
          direction={props.direction}
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
          itemToString={(item?: StorageUnit) => item?.unitName ?? ""}
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

export default ControlledStorageUnitSelector;
