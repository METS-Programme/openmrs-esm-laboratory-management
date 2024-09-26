import React from "react";
import { Control, Controller, FieldValues } from "react-hook-form";
import { Checkbox } from "@carbon/react";

interface ControlledCheckBoxProps<T> {
  controllerName: string;
  name: string;
  control: Control<FieldValues, T>;
  value?: boolean;
  labelText?: string;
  onChange?: (value: boolean) => void;
}

const ControlledCheckBox = <T,>(props: ControlledCheckBoxProps<T>) => {
  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange, value, ref } }) => (
        <Checkbox
          checked={value}
          ref={ref}
          id={props.controllerName}
          onChange={() => {
            onChange(Boolean(!value));
            if (props["onChange"]) {
              props["onChange"](!value);
            }
          }}
          labelText={props.labelText}
        />
      )}
    />
  );
};

export default ControlledCheckBox;
