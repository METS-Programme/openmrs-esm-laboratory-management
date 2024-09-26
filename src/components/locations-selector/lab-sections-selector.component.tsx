import React, { ReactNode } from "react";
import { TextInputSkeleton, Select, SelectItem } from "@carbon/react";
import { useLaboratoryConfig } from "../../hooks/useLaboratoryConfig";
import { useLocations } from "@openmrs/esm-framework";

interface LabSectionSelectorProps<T> {
  className?: string;
  onChange?: (value: string) => void;
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;
  name?: string;
  value?: string;
  translator: (key: string, defaultValue: string) => string;
  style?: any;
}

const LabSectionSelector = <T,>(props: LabSectionSelectorProps<T>) => {
  const {
    laboratoryConfig: { laboratoryLocationTag },
  } = useLaboratoryConfig();
  const locations = useLocations(laboratoryLocationTag);

  if (!locations) return <TextInputSkeleton />;

  return (
    <Select
      {...props}
      type="text"
      labelText={""}
      onChange={(e) => props?.onChange?.(e.target.value)}
      value={props?.value ?? ""}
    >
      <SelectItem
        text={props.translator("laboratoryAllLabSections", "All Lab Sections")}
        value=""
      />
      {locations &&
        locations.map((location) => (
          <SelectItem
            title={location.display}
            key={location.uuid}
            text={location.display}
            value={location.uuid}
          >
            {location.display}
          </SelectItem>
        ))}
    </Select>
  );
};

export default LabSectionSelector;
