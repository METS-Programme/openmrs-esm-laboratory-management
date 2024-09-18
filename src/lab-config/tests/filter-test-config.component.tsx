import React from "react";
import { RadioButton, RadioButtonGroup } from "@carbon/react";
import styles from "./filter-test-config.scss";

interface FilterTestConfigProps {
  filterType?: boolean | null;
  changeFilterType: React.Dispatch<
    React.SetStateAction<boolean | null | undefined>
  >;
}

const FilterTestConfig: React.FC<FilterTestConfigProps> = ({
  filterType,
  changeFilterType,
}) => {
  return (
    <RadioButtonGroup
      name="is-active"
      defaultSelected={filterType != null ? filterType.toString() : ""}
      onChange={(p) => changeFilterType(p.length == 0 ? null : p == "true")}
      className={styles.spacing}
    >
      <RadioButton labelText="All" value="" id="is-active-all" />
      <RadioButton labelText="Active" value="true" id="is-active-active" />
      <RadioButton labelText="Disabled" value="false" id="is-active-disabled" />
    </RadioButtonGroup>
  );
};

export default FilterTestConfig;
