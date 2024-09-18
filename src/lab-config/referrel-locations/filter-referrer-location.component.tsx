import React from "react";
import {
  RadioButton,
  RadioButtonGroup,
  Select,
  SelectItem,
} from "@carbon/react";
import styles from "./filter-referrer-location.scss";
import { useTranslation } from "react-i18next";
import { boolean } from "zod";

interface FilterReferrerLocationProps {
  filterType?: boolean | null;
  referIn?: boolean | null;
  referOut?: boolean | null;
  changeFilterType: React.Dispatch<
    React.SetStateAction<boolean | null | undefined>
  >;
  changeReferrerIn: React.Dispatch<
    React.SetStateAction<boolean | null | undefined>
  >;
  changeReferrerOut: React.Dispatch<
    React.SetStateAction<boolean | null | undefined>
  >;
}

const FilterReferrerLocation: React.FC<FilterReferrerLocationProps> = ({
  filterType,
  changeFilterType,
  changeReferrerIn,
  changeReferrerOut,
  referIn,
  referOut,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <Select
        className={styles.select}
        type="text"
        labelText={""}
        value={filterType == null ? "" : filterType.toString()}
        rules={{ required: true }}
        onChange={(event) =>
          changeFilterType(
            (event.target.value?.length ?? 0) == 0
              ? null
              : event.target.value == "true"
          )
        }
      >
        <SelectItem text={t("all", "All")} value="" />
        <SelectItem
          text={t("laboratoryReferrerActiveYes", "Active: Yes")}
          value={"true"}
        ></SelectItem>
        <SelectItem
          text={t("laboratoryReferrerActiveNo", "Active: No")}
          value={"false"}
        ></SelectItem>
      </Select>
      <Select
        className={styles.select}
        value={referIn == null ? "" : referIn.toString()}
        type="text"
        labelText={""}
        rules={{ required: true }}
        onChange={(event) =>
          changeReferrerIn(
            (event.target.value?.length ?? 0) == 0
              ? null
              : event.target.value == "true"
          )
        }
      >
        <SelectItem text={t("all", "All")} value="" />
        <SelectItem
          text={t("laboratoryReferrerInYes", "Refer-From: Yes")}
          value={"true"}
        ></SelectItem>
        <SelectItem
          text={t("laboratoryReferrerInNo", "Refer-From: No")}
          value={"false"}
        ></SelectItem>
      </Select>
      <Select
        className={styles.select}
        value={referOut == null ? "" : referOut.toString()}
        type="text"
        labelText={""}
        rules={{ required: true }}
        onChange={(event) =>
          changeReferrerOut(
            (event.target.value?.length ?? 0) == 0
              ? null
              : event.target.value == "true"
          )
        }
      >
        <SelectItem text={t("all", "All")} value="" />
        <SelectItem
          text={t("laboratoryReferrerOutYes", "Refer-to: Yes")}
          value={"true"}
        ></SelectItem>
        <SelectItem
          text={t("laboratoryReferrerOutNo", "Refer-to: No")}
          value={"false"}
        ></SelectItem>
      </Select>
    </>
  );
};

export default FilterReferrerLocation;
