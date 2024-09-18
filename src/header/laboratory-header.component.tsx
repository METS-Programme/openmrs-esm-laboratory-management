import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Location } from "@carbon/react/icons";
import { useSession } from "@openmrs/esm-framework";
import LaboratoryIllustration from "./laboratory-illustration.component";
import styles from "./laboratory-header.scss";
import { DatePicker, DatePickerInput } from "@carbon/react";
import dayjs from "dayjs";
import { changeStartDate } from "../store";
import { useOrderDate } from "../hooks/useOrderDate";

export interface LaboratoryHeader {
  showDate: boolean;
  sectionTitle?: string;
}

export const LaboratoryHeader: React.FC<LaboratoryHeader> = ({
  showDate,
  sectionTitle,
}) => {
  const { t } = useTranslation();
  const datePickerRef = useRef(null);
  const userSession = useSession();
  const userLocation = userSession?.sessionLocation?.display;
  const { currentOrdersDate } = useOrderDate();

  return (
    <div className={styles.header}>
      <div className={styles["left-justified-items"]}>
        <LaboratoryIllustration />
        <div className={styles["page-labels"]}>
          {sectionTitle && <p>{sectionTitle}</p>}
          <p className={styles["page-name"]}>{t("laboratory", "Laboratory")}</p>
        </div>
      </div>
      <div
        className={`${styles["right-justified-items"]}${
          !showDate ? ` ${styles["right-justified-items-no-date"]}` : ""
        }`}
      >
        <div className={styles["date-and-location"]}>
          <Location size={16} />
          <span className={styles.value}>{userLocation}</span>
          {showDate && (
            <>
              <span className={styles.middot}>&middot;</span>
              <DatePicker
                onChange={([date]) => changeStartDate(new Date(date))}
                ref={datePickerRef}
                dateFormat="Y-m-d"
                datePickerType="single"
              >
                <DatePickerInput
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    maxWidth: "10rem",
                  }}
                  id="date-picker-calendar-id"
                  placeholder="YYYY-MM-DD"
                  labelText=""
                  type="text"
                  value={dayjs(currentOrdersDate).format("YYYY-MM-DD")}
                />
              </DatePicker>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
