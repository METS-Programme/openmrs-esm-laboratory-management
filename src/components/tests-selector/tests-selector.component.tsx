import React, {
  ChangeEvent,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Control, Controller, FieldValues } from "react-hook-form";
import { useLazyApprovalFlows } from "../../api/approval-flow.resource";
import {
  TextInputSkeleton,
  Select,
  SelectItem,
  Button,
  FilterableMultiSelect,
} from "@carbon/react";
import { TestConfig } from "../../api/types/test-config";
import styles from "./tests-selector.scss";
import { useTranslation } from "react-i18next";
import LocationTests from "./location-tests.component";
import { DiagonisticCenterTests } from "../../api/types/sample";
import {
  Location as DiagonisticCenter,
  showModal,
} from "@openmrs/esm-framework";
import { TrashCan, Add, View } from "@carbon/react/icons";

interface TestsSelectorProps<T> {
  defaultValue?: DiagonisticCenterTests;
  title?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: ReactNode;
  locations?: Array<DiagonisticCenter>;
  availableTests?: Array<TestConfig>;

  // Control
  controllerName: string;
  name: string;
  id: string;
  control: Control<FieldValues, T>;
  updateValue: (value: DiagonisticCenterTests) => void;
  onChange: (value: DiagonisticCenterTests) => void;
}

const TestsSelector = <T,>(props: TestsSelectorProps<T>) => {
  const {
    items: { results: approvalFlows },
    isLoading,
    isValidating,
    getApprovalFlows,
  } = useLazyApprovalFlows();
  const [inputValue, setInputValue] = useState("");
  const { t } = useTranslation();
  const [renderMultiSelect, setRenderMultiSelect] = useState<number>(100); // Hack to work around clearing the multiselect
  const [availableTests, setAvailableTests] = useState<Array<TestConfig>>(
    () => {
      return props.availableTests ?? [];
    }
  );
  const [locationTests, setLocationTests] = useState<DiagonisticCenterTests>(
    props.defaultValue
  );

  const refreshAvailableTests = () => {
    let testsToExclude = new Set(
      Object.entries(locationTests)
        .map(([k, v]) =>
          !k.startsWith("NEW-") ? v.tests.map((x) => x.uuid) : []
        )
        .flatMap((p) => p)
    );
    setAvailableTests(
      props.availableTests?.filter((p) => !testsToExclude.has(p.uuid)) ?? []
    );
    setRenderMultiSelect((s) => s + 1);
  };

  const onUpdateTests = (value: any, recalcAvailableTests) => {
    props.onChange(value);
    setLocationTests(value);
    if (recalcAvailableTests) {
      refreshAvailableTests();
    }
  };

  const preferredLocation = useMemo(() => {
    if (locationTests) {
      let [center, tests] = Object.entries(locationTests).find(([k, v]) =>
        k.startsWith("NEW-")
      ) ?? [undefined, undefined];

      if (center) {
        center = center.length > 4 ? center.substring(4) : undefined;
      }
      return { center: center, value: tests ?? { tests: [] } };
    }
    return { center: undefined, value: { tests: [], center: undefined } };
  }, [locationTests]);

  const updateValue = props.updateValue;

  const viewAllTests = useCallback(() => {
    const dispose = showModal("lab-request-test-select-dialog", {
      closeModal: () => dispose(),
      availableTests: availableTests,
      initialSelection: locationTests
        ? Object.entries(locationTests)
            .filter(([k, v]) => k.startsWith("NEW-"))
            .map(([k, v]) => v?.tests ?? [])
            .flatMap((p) => p)
        : [],
      onSelectionComplete: (selectedItems) => {
        let newLocations = { ...(locationTests ?? {}) };
        let [newEntryKey, newEntryValue] = Object.entries(newLocations).find(
          ([k, v]) => k.startsWith("NEW-")
        ) ?? [undefined, undefined];
        if (newEntryKey && newEntryValue) {
          newEntryValue.tests = [...selectedItems];
        }
        setLocationTests(newLocations);
        updateValue(newLocations);
        setRenderMultiSelect((s) => s + 1);
        dispose();
      },
    });
  }, [availableTests, locationTests, updateValue]);

  if (isLoading) return <TextInputSkeleton />;

  return (
    <Controller
      name={props.controllerName}
      control={props.control}
      render={({ field: { onChange, ref, value } }) => {
        return (
          <>
            {Object.entries(value as DiagonisticCenterTests).map(
              ([key, locationDiagnosticTests]) =>
                !key.startsWith("NEW") ? (
                  <section key={key} className={styles.locationLabRequest}>
                    <LocationTests
                      readonly={false}
                      center={locationDiagnosticTests.center}
                      tests={locationDiagnosticTests.tests}
                      showLocation={true}
                      deleteAllTests={(center) => {
                        let newLocations = {
                          ...(value as unknown as DiagonisticCenterTests),
                        };
                        delete newLocations[center.uuid];
                        onChange(newLocations);
                        setRenderMultiSelect((s) => s + 1);
                        onUpdateTests(newLocations, true);
                      }}
                      deleteTest={(center, test) => {
                        let newLocations = {
                          ...(value as unknown as DiagonisticCenterTests),
                        };
                        if (locationDiagnosticTests.tests.length < 2) {
                          delete newLocations[center.uuid];
                        } else {
                          newLocations[center.uuid].tests = newLocations[
                            center.uuid
                          ].tests.filter((p) => p.uuid != test.uuid);
                        }
                        onChange(newLocations);
                        setRenderMultiSelect((s) => s + 1);
                        onUpdateTests(newLocations, true);
                      }}
                    />
                  </section>
                ) : (
                  <></>
                )
            )}
            <section className={styles.locationLabRequest}>
              {(!props.locations || props.locations.length == 0) && (
                <TextInputSkeleton />
              )}
              {props.locations?.length > 0 && (
                <Select
                  className={styles.textInput}
                  type="text"
                  labelText={t("laboratoryDiagonisticCenter", "Lab Section")}
                  rules={{ required: true }}
                  value={preferredLocation?.center ?? ""}
                  invalid={!preferredLocation?.center && props.invalid}
                  invalidText={props.invalidText}
                  onChange={(evt: ChangeEvent<HTMLSelectElement>) => {
                    let newLocations = { ...(value ?? {}) };
                    let [newEntryKey, newEntryValue] = Object.entries(
                      newLocations
                    ).find(([k, v]) => k.startsWith("NEW-")) ?? [
                      undefined,
                      undefined,
                    ];
                    if (newEntryKey) {
                      delete newLocations[newEntryKey];
                    }
                    if (evt.target.value) {
                      newLocations[`NEW-${evt.target.value}`] = {
                        tests: [...(newEntryValue?.["tests"] ?? [])],
                        center: props.locations?.find(
                          (p) => p.uuid == evt.target.value
                        ),
                      };
                    }
                    onChange(newLocations);
                    onUpdateTests(newLocations, true);
                  }}
                >
                  {!preferredLocation?.center && (
                    <SelectItem
                      text={t(
                        "laboratoryDiagonisticCenterSelect",
                        "Select Location"
                      )}
                      value=""
                    />
                  )}
                  {props.locations?.map((location) => (
                    <SelectItem
                      key={location.uuid}
                      text={location.display}
                      value={location.uuid}
                    >
                      {location.display}
                    </SelectItem>
                  ))}
                </Select>
              )}

              {preferredLocation?.center && (
                <div className={styles.labRequests}>
                  <div className={`cds--label ${styles.labRequestsHeader}`}>
                    <span>Lab Request(s):</span>
                    <Button
                      kind="ghost"
                      onClick={viewAllTests}
                      renderIcon={(props) => <View size={16} {...props} />}
                    >
                      {t("LaboratoryAllTests", "All Tests")}
                    </Button>
                  </div>

                  {!props.availableTests && <TextInputSkeleton />}
                  {availableTests && (
                    <>
                      <div className={styles.selectedTests}>
                        {preferredLocation?.value?.tests?.map((test, index) => (
                          <div
                            className={`${styles.selectedTest} ${
                              preferredLocation?.value?.tests.length % 2 == 0
                                ? index % 2 == 0
                                  ? styles.selectedTestAltRow
                                  : ""
                                : index % 2 == 1
                                ? styles.selectedTestAltRow
                                : ""
                            }`}
                          >
                            <div className={styles.selectedTestName}>
                              <span>
                                {index + 1}
                                {"."}&nbsp;
                              </span>
                              <span>
                                {test?.testShortName
                                  ? `${test?.testShortName}${
                                      test?.testName
                                        ? ` (${test.testName})`
                                        : ""
                                    }`
                                  : test?.testName}
                              </span>
                            </div>
                            <Button
                              kind="ghost"
                              onClick={() => {
                                let newLocations = { ...(value ?? {}) };
                                let [newEntryKey, newEntryValue] =
                                  Object.entries(newLocations).find(([k, v]) =>
                                    k.startsWith("NEW-")
                                  ) ?? [undefined, undefined];
                                if (
                                  !newEntryKey ||
                                  !newEntryValue ||
                                  (newEntryValue["tests"]?.length ?? 0) == 0
                                ) {
                                  return;
                                }
                                newLocations[newEntryKey].tests =
                                  newLocations[newEntryKey].tests?.filter(
                                    (p) => p.uuid != test.uuid
                                  ) ?? [];
                                onChange(newLocations);
                                setRenderMultiSelect((s) => s + 1);
                                onUpdateTests(newLocations, true);
                              }}
                              renderIcon={(props) => (
                                <TrashCan size={16} {...props} />
                              )}
                            />
                          </div>
                        ))}
                      </div>
                      {preferredLocation?.value?.tests?.length > 0 && (
                        <div>
                          <Button
                            size="sm"
                            iconDescription="Add"
                            hasIcon={true}
                            renderIcon={(props) => <Add {...props} size={16} />}
                            kind="ghost"
                            onClick={() => {
                              let newLocations = value ?? {};
                              let [newEntryKey, newEntryValue] = Object.entries(
                                newLocations
                              ).find(([k, v]) => k.startsWith("NEW-")) ?? [
                                undefined,
                                undefined,
                              ];
                              if (
                                !newEntryKey ||
                                !newEntryValue ||
                                (newEntryValue["tests"]?.length ?? 0) == 0
                              ) {
                                return;
                              }
                              var originalEntry = newEntryKey;
                              newEntryKey = newEntryKey.substring(4);
                              let tmpLocationTest = { ...newLocations };
                              if (!tmpLocationTest[newEntryKey]) {
                                tmpLocationTest[newEntryKey] = {
                                  center: props.locations.find(
                                    (p) => p.uuid == newEntryKey
                                  ),
                                  tests: new Array(),
                                };
                              }
                              tmpLocationTest[newEntryKey].tests = [
                                ...new Set([
                                  ...tmpLocationTest[newEntryKey].tests,
                                  ...newEntryValue["tests"],
                                ]),
                              ];
                              delete tmpLocationTest[originalEntry];
                              tmpLocationTest[originalEntry] = {
                                center: tmpLocationTest[newEntryKey].center,
                                tests: [],
                              };
                              onChange(tmpLocationTest);
                              setRenderMultiSelect((s) => s + 1);
                              onUpdateTests(tmpLocationTest, true);
                            }}
                          >
                            {t(
                              "laboratoryAddForAnotherLocation",
                              "Add For Other Lab Section"
                            )}
                          </Button>
                        </div>
                      )}
                      <div
                        className={`${styles.multiSelectedCombo}`}
                        style={{ backgroundColor: "white" }}
                      >
                        <FilterableMultiSelect
                          downshiftProps={{
                            inputId: "labRequestMultiSelectedCombo",
                          }}
                          key={renderMultiSelect}
                          direction="top"
                          titleText={props.title}
                          name={props.name}
                          control={props.control}
                          controllerName={props.controllerName}
                          id={props.id}
                          placeholder={props.placeholder}
                          initialSelectedItems={preferredLocation?.value?.tests}
                          selectedItems={preferredLocation?.value?.tests}
                          onChange={(data) => {
                            let newLocations = { ...(value ?? {}) };
                            let [newEntryKey, newEntryValue] = Object.entries(
                              newLocations
                            ).find(([k, v]) => k.startsWith("NEW-")) ?? [
                              undefined,
                              undefined,
                            ];
                            if (newEntryKey) {
                              newEntryValue["tests"] = data.selectedItems;
                              onChange(newLocations);
                              onUpdateTests(newLocations, false);
                            }
                          }}
                          items={props.availableTests}
                          itemToString={(item?: TestConfig) =>
                            (item?.testShortName
                              ? `${item?.testShortName}${
                                  item?.testName ? ` (${item.testName})` : ""
                                }`
                              : item?.testName) ?? ""
                          }
                          selectionFeedback="top-after-reopen"
                          ref={ref}
                          invalid={props.invalid}
                          invalidText={props.invalidText}
                          size={"sm"}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </section>
          </>
        );
      }}
    />
  );
};

export default TestsSelector;
