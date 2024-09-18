import React, { ChangeEvent, ReactNode } from "react";
import { CareSetting } from "../../api/types/care-setting";
import { Control, Controller, FieldValues } from "react-hook-form";
import { useCareSettings } from "../../api/care-setting.resource";
import { SelectSkeleton, Select, SelectItem } from "@carbon/react";

interface CareSettingSelectorProps<T> {
  className?: string;
  onChange?: (unit: CareSetting) => void;
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;
  labelText?: string;
  selectedId?: string;
  selectedText?: string;
  // Control
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
  idSuffix?: string;
}

const CareSettingSelector = <T,>(props: CareSettingSelectorProps<T>) => {
  const {
    items: { results: careSettingOptions },
    isLoading,
  } = useCareSettings({});

  if (isLoading) return <SelectSkeleton />;

  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange } }) => (
        <>
          <Select
            name={props.name}
            control={props.control}
            controllerName={props.controllerName}
            id={`${props.name}-${props.idSuffix}`}
            className={props.className}
            labelText={props.labelText}
            value={props.selectedId ?? ""}
            onChange={(evt: ChangeEvent<HTMLSelectElement>) => {
              onChange(evt.target.value);
            }}
            placeholder={props.placeholder}
            invalid={props.invalid}
            invalidText={props.invalidText}
            size="md"
            titleText={props.title}
          >
            {props.selectedId &&
              !Boolean(
                careSettingOptions?.some((x) => x.uuid === props.selectedId)
              ) && (
                <SelectItem
                  key={props.selectedId}
                  text={props.selectedText}
                  value={props.selectedId}
                >
                  {props.selectedText}
                </SelectItem>
              )}
            {careSettingOptions?.map((careSetting) => (
              <SelectItem
                key={careSetting.uuid}
                text={careSetting.display}
                value={careSetting.uuid}
              >
                {careSetting.display}
              </SelectItem>
            ))}
          </Select>
        </>
      )}
    />
  );
};

export default CareSettingSelector;
