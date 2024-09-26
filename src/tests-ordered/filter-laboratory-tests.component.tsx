import React from "react";
import {
  Select,
  SelectItem,
  DatePicker,
  DatePickerInput,
  Button,
  Toggle,
  MultiSelect,
} from "@carbon/react";
import styles from "./filter-laboratory-tests.component.scss";
import { useTranslation } from "react-i18next";
import { Close } from "@carbon/react/icons";
import {
  formatAsPlainDateForTransfer,
  formatAsPlainEndOfDayDateForTransfer,
  formatForDatePicker,
} from "../utils/date-utils";
import { useLocations } from "@openmrs/esm-framework";
import { useTestConfigs } from "../api/test-config.resource";
import { formatTestName } from "../components/test-name";
import { useLaboratoryConfig } from "../hooks/useLaboratoryConfig";
import { WorksheetItemStatuses } from "../api/types/worksheet-item";
import {
  TestRequestItemMatchOptions,
  TestRequestItemStatuses,
} from "../api/types/test-request-item";
import { SampleStatuses } from "../api/types/sample";
import StorageSelector from "../components/storage/storage-selector.component";
import PatientsFilterSelector from "../components/patient-selector/patient-filter-selector.component";

interface FilterTestsProps {
  testConceptUuid?: string | null;
  maxActivatedDate?: Date | null | string;
  diagnosticCenterUuid?: string;
  minActivatedDate?: Date | null | string;
  focus?: boolean | null;
  enableFocus?: boolean | null;
  enableWorksheetStatus?: boolean | null;
  enableTestRequestItemStatus?: boolean;
  testRequestItemStatuses?: string;
  enableItemMatch?: boolean;
  itemMatch?: string;
  excluteItemMatchOptions?: Array<string>;
  datePickerType?: "single" | "range";
  enableSampleStatus?: boolean;
  sampleStatuses?: string;
  enableStorage?: boolean;
  disableLabSection?: boolean;
  disableTests?: boolean;
  enablePatient?: boolean;

  onPatientChanged?: React.Dispatch<
    React.SetStateAction<string | null | undefined>
  >;
  onStorageChanged?: React.Dispatch<
    React.SetStateAction<string | null | undefined>
  >;
  onSampleStatusesChanged?: React.Dispatch<
    React.SetStateAction<string | null | undefined>
  >;
  onTestRequestItemStatusesChanged?: React.Dispatch<
    React.SetStateAction<string | null | undefined>
  >;
  worksheetStatus?: string;
  onMaxActivatedDateChanged: React.Dispatch<
    React.SetStateAction<Date | String | null | undefined>
  >;
  onMinActivatedDateChanged?: React.Dispatch<
    React.SetStateAction<Date | String | null | undefined>
  >;
  onDiagnosticCenterChanged?: React.Dispatch<
    React.SetStateAction<string | null | undefined>
  >;
  onTestChanged?: React.Dispatch<
    React.SetStateAction<string | null | undefined>
  >;
  onFocusChanged?: React.Dispatch<
    React.SetStateAction<boolean | null | undefined>
  >;
  onWorksheetStatusChanged?: React.Dispatch<
    React.SetStateAction<string | null | undefined>
  >;
  onItemMatchChanged?: React.Dispatch<
    React.SetStateAction<string | null | undefined>
  >;
}

const FilterLaboratoryTests: React.FC<FilterTestsProps> = ({
  diagnosticCenterUuid,
  maxActivatedDate,
  minActivatedDate,
  onDiagnosticCenterChanged,
  onMaxActivatedDateChanged,
  onMinActivatedDateChanged,
  testConceptUuid,
  onTestChanged,
  onFocusChanged,
  focus,
  enableFocus,
  enableWorksheetStatus,
  onWorksheetStatusChanged,
  worksheetStatus,
  enableTestRequestItemStatus,
  testRequestItemStatuses,
  onTestRequestItemStatusesChanged,
  itemMatch,
  enableItemMatch,
  excluteItemMatchOptions,
  onItemMatchChanged,
  datePickerType = "single",
  enableSampleStatus,
  onSampleStatusesChanged,
  sampleStatuses,
  enableStorage,
  onStorageChanged,
  disableLabSection,
  disableTests,
  enablePatient,
  onPatientChanged,
}) => {
  const { t } = useTranslation();
  const {
    laboratoryConfig: { laboratoryLocationTag },
  } = useLaboratoryConfig();
  const locations = useLocations(laboratoryLocationTag);

  const {
    items: { results: testOptions },
  } = useTestConfigs({ active: true });

  const onSampleStatusesChangedInternal = ({
    selectedItems,
  }: {
    selectedItems: string[];
  }): void => {
    if (!selectedItems || selectedItems.length === 0) {
      onSampleStatusesChanged(null);
    } else {
      onSampleStatusesChanged(
        selectedItems.reduce((p, c, i) => {
          if (i === 0) return c;
          p += (p.length > 0 ? "," : "") + c;
          return p;
        }, "")
      );
    }
  };

  const onTestRequestItemStatusesChangedInternal = ({
    selectedItems,
  }: {
    selectedItems: string[];
  }): void => {
    if (!selectedItems || selectedItems.length === 0) {
      onTestRequestItemStatusesChanged(null);
    } else {
      onTestRequestItemStatusesChanged(
        selectedItems.reduce((p, c, i) => {
          if (i === 0) return c;
          p += (p.length > 0 ? "," : "") + c;
          return p;
        }, "")
      );
    }
  };

  return (
    <>
      {datePickerType == "single" ? (
        <DatePicker
          className={styles.dateInput}
          onChange={([date]) =>
            onMaxActivatedDateChanged(
              formatAsPlainEndOfDayDateForTransfer(date)
            )
          }
          dateFormat="Y-m-d"
          datePickerType="single"
          minDate={formatForDatePicker(minActivatedDate)}
          locale="en"
          allowInput={true}
        >
          <DatePickerInput
            hideLabel={true}
            placeholder={t(
              "laboratoryTestsFileterMaxActivatedDate",
              "Max: YYYY-MM-DD"
            )}
            labelText=""
            type="text"
            value={formatForDatePicker(maxActivatedDate)}
            allowInput={true}
          />
          {maxActivatedDate && (
            <Button
              className={styles.clearDate}
              kind="ghost"
              onClick={() => onMaxActivatedDateChanged(null)}
              renderIcon={(props) => <Close size={16} {...props} />}
            />
          )}
        </DatePicker>
      ) : (
        <DatePicker
          datePickerType="range"
          className={styles.dateInput}
          onChange={(dates: Date[]) => {
            onMinActivatedDateChanged?.(
              dates[0] ? formatAsPlainDateForTransfer(dates[0]) : null
            );
            onMaxActivatedDateChanged(
              dates[1] ? formatAsPlainEndOfDayDateForTransfer(dates[1]) : null
            );
          }}
          dateFormat="Y-m-d"
          locale="en"
          allowInput={true}
        >
          <DatePickerInput
            hideLabel={true}
            placeholder={t("laboratoryTestsFileterMaxActivatedDate", "From")}
            labelText=""
            autoComplete="off"
            type="text"
            defaultValue={formatForDatePicker(minActivatedDate)}
            onChange={(evt) => {
              if ((evt?.target?.value ?? "").length == 0) {
                onMinActivatedDateChanged(null);
              }
            }}
            allowInput={true}
          />
          <DatePickerInput
            hideLabel={true}
            placeholder={t("laboratoryTestsFileterMaxActivatedDate", "To")}
            labelText=""
            autoComplete="off"
            type="text"
            defaultValue={formatForDatePicker(maxActivatedDate)}
            onChange={(evt) => {
              if ((evt?.target?.value ?? "").length == 0) {
                onMaxActivatedDateChanged(null);
              }
            }}
            allowInput={true}
          />
        </DatePicker>
      )}
      {enableFocus && (
        <Button
          size="sm"
          className={styles.headerButton}
          kind="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onFocusChanged(!focus);
          }}
        >
          <Toggle
            className={styles.clearToggleMargin}
            size="sm"
            labelText={t("focus", "Focus")}
            labelA=""
            labelB=""
            key={focus}
            defaultToggled={!focus}
          />
        </Button>
      )}

      {enableStorage && (
        <StorageSelector
          name="sampleStorageSearch"
          placeholder={t("laboratoryStorage", "Storage")}
          onChange={(e) => onStorageChanged(e?.uuid)}
        />
      )}

      {enableItemMatch && (
        <Select
          className={styles.select}
          type="text"
          labelText={""}
          onChange={(e) => onItemMatchChanged(e.target.value)}
          value={itemMatch}
        >
          <SelectItem
            text={t("laboratoryTestRequestItemMatchAll", "All Tests")}
            value=""
          />
          {TestRequestItemMatchOptions.map((status) => (
            <>
              {(!excluteItemMatchOptions ||
                excluteItemMatchOptions.indexOf(status) < 0) && (
                <SelectItem
                  title={t(`TestRequestItemMatch${status}`)}
                  key={status}
                  text={t(`TestRequestItemMatch${status}`)}
                  value={status}
                ></SelectItem>
              )}
            </>
          ))}
        </Select>
      )}
      {enableSampleStatus && (
        <MultiSelect
          hideLabel={true}
          useTitleInItem={true}
          onChange={onSampleStatusesChangedInternal}
          inline
          placeholder={t("laboratorySampleStatus", "Sample Status")}
          titleText={t("laboratorySampleStatus", "Sample Status")}
          label={t("laboratorySampleStatus", "Sample Status")}
          items={SampleStatuses ?? []}
          itemToString={(item) => (item ? t(item) : "")}
          selectionFeedback="top-after-reopen"
        ></MultiSelect>
      )}
      {enableTestRequestItemStatus && (
        <MultiSelect
          hideLabel={true}
          useTitleInItem={true}
          onChange={onTestRequestItemStatusesChangedInternal}
          inline
          placeholder={t("laboratoryTestItemStatus", "Test Status")}
          titleText={t("laboratoryTestItemStatus", "Test Status")}
          label={t("laboratoryTestItemStatus", "Test Status")}
          items={TestRequestItemStatuses ?? []}
          itemToString={(item) => (item ? t(item) : "")}
          selectionFeedback="top-after-reopen"
        ></MultiSelect>
      )}
      {enableWorksheetStatus && (
        <Select
          className={styles.select}
          type="text"
          labelText={""}
          onChange={(e) => onWorksheetStatusChanged(e.target.value)}
          value={worksheetStatus}
        >
          <SelectItem
            text={t("laboratoryAllWorksheetStatuses", "All States")}
            value=""
          />
          {WorksheetItemStatuses.map((status) => (
            <SelectItem
              title={t(status)}
              key={status}
              text={t(status)}
              value={status}
            ></SelectItem>
          ))}
        </Select>
      )}
      {!disableTests && (
        <Select
          className={styles.testSelect}
          type="text"
          labelText={""}
          onChange={(e) => onTestChanged(e.target.value)}
          value={testConceptUuid}
        >
          <SelectItem text={t("laboratoryAllTests", "All Tests")} value="" />
          {testOptions &&
            testOptions.map((test) => (
              <SelectItem
                title={formatTestName(test.testName, test.testShortName)}
                key={test.testUuid}
                text={formatTestName(test.testName, test.testShortName)}
                value={test.testUuid}
              >
                {formatTestName(test.testName, test.testShortName)}
              </SelectItem>
            ))}
        </Select>
      )}
      {!disableLabSection && (
        <Select
          className={styles.select}
          type="text"
          labelText={""}
          onChange={(e) => onDiagnosticCenterChanged(e.target.value)}
          value={diagnosticCenterUuid}
        >
          <SelectItem
            text={t("laboratoryAllLabSections", "All Lab Sections")}
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
      )}
      {enablePatient && (
        <PatientsFilterSelector
          className={styles.patient}
          title=""
          placeholder={t("laboratoryPatient", "Patient")}
          name="patientUuid"
          onPatientUuidChange={(e) => onPatientChanged(e?.uuid)}
        ></PatientsFilterSelector>
      )}
    </>
  );
};

export default FilterLaboratoryTests;
