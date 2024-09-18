import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Sample } from "../../api/types/sample";
import { Control, Controller, FieldValues } from "react-hook-form";
import { ComboBox, TextInputSkeleton } from "@carbon/react";
import { useLazySamples } from "../../api/sample.resource";
import { ResourceRepresentation } from "../../api/resource-filter-criteria";
import debounce from "lodash-es/debounce";

interface ControlledSampleSelectorProps<T> {
  className?: string;
  referralLocationUuid?: string;
  patientUuid?: string;
  sampleStatus?: string;
  assigned?: boolean;
  active?: boolean;
  selectedId?: string;
  selectedText?: string;
  onChange?: (unit: Sample) => void;
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

const ControlledSampleSelector = <T,>(
  props: ControlledSampleSelectorProps<T>
) => {
  const [inputValue, setInputValue] = useState("");
  const {
    items: { results: sampleOptions },
    isValidating,
    getSamples,
  } = useLazySamples({
    limit: 10,
    patient: props.patientUuid,
    referralLocation: props.referralLocationUuid,
  });

  const loadSamples = useCallback(
    (searchTerm: string) => {
      if (props.referralLocationUuid || props.patientUuid) {
        getSamples({
          q: searchTerm,
          startIndex: 0,
          limit: 10,
          referralLocation: props.referralLocationUuid,
          patient: props.patientUuid,
          sampleStatus: props.sampleStatus,
        });
      }
    },
    [
      getSamples,
      props.patientUuid,
      props.referralLocationUuid,
      props.sampleStatus,
    ]
  );

  useEffect(() => {
    loadSamples(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStorageSearch = useMemo(
    () =>
      debounce((searchTerm) => {
        loadSamples(searchTerm);
      }, 300),
    [loadSamples]
  );

  const handleInputChange = (value) => {
    setInputValue(value);
    handleStorageSearch(value);
  };

  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange } }) => (
        <ComboBox
          key={props.referralLocationUuid ?? "Samples"}
          style={props.style}
          titleText={props.title}
          direction={props.direction}
          hideLabel={props.hideLabel}
          name={props.name}
          size="md"
          items={
            props.selectedId
              ? [
                  ...(sampleOptions?.some((x) => x.uuid === props.selectedId)
                    ? []
                    : [
                        {
                          uuid: props.selectedId,
                          display: props.selectedText,
                        },
                      ]),
                  ...(sampleOptions ?? []),
                ]
              : sampleOptions || []
          }
          onChange={(data: { selectedItem: Sample }) => {
            onChange(data?.selectedItem?.uuid);
            props.onChange?.(data?.selectedItem);
          }}
          initialSelectedItem={
            props.selectedId
              ? sampleOptions?.find((p) => p.uuid === props.selectedId) ?? {
                  uuid: props.selectedId,
                  display: props.selectedText,
                }
              : null
          }
          itemToString={(item?: Sample) =>
            `${item?.accessionNumber ?? ""} - ${item?.sampleTypeName}${
              item?.providedRef || item?.externalRef
                ? ` (External ID: ${item?.providedRef ?? item?.externalRef})`
                : ""
            }`
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

export default ControlledSampleSelector;
