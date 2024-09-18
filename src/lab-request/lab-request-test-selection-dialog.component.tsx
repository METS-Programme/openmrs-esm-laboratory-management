import React, { useCallback, useMemo, useState } from "react";
import { TestConfig } from "../api/types/test-config";
import styles from "./lab-request-test-selection-dialog.component.scss";
import {
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Tile,
  Checkbox,
  Search,
} from "@carbon/react";
import { useTranslation } from "react-i18next";
import debounce from "lodash-es/debounce";

interface LabRequestTestSelectProps {
  availableTests: Array<TestConfig>;
  initialSelection?: Array<TestConfig>;
  onSelectionComplete: (selected: Array<TestConfig>) => void;
  closeModal: () => void;
}

const LabRequestTestSelect: React.FC<LabRequestTestSelectProps> = ({
  availableTests,
  initialSelection,
  onSelectionComplete,
  closeModal,
}) => {
  const { t } = useTranslation();
  const [searchString, setSearchString] = useState("");
  const [selected, setSelected] = useState(() => {
    let groups: {
      [key: string]: TestConfig;
    } = {};
    return (
      initialSelection?.reduce((a, p) => {
        a[p.uuid] = p;
        return a;
      }, groups) ?? groups
    );
  });

  const testGroups = useMemo(() => {
    let groups: {
      [key: string]: { group: string; tests: Array<TestConfig> };
    } = {};
    let groupValues = Object.values(
      availableTests.reduce((group, current) => {
        if (!group[current.testGroupUuid]) {
          group[current.testGroupUuid] = group[current.testGroupUuid] ?? {
            group: current.testGroupName,
            tests: [current],
          };
        } else {
          group[current.testGroupUuid].tests = [
            ...group[current.testGroupUuid].tests,
            current,
          ];
        }
        return group;
      }, groups)
    );
    if (searchString) {
      let q = searchString.toLowerCase();
      groupValues = groupValues
        .map((p) => {
          if (p.group.toLowerCase().indexOf(q) > -1) return p;
          p.tests = p.tests.filter(
            (p) =>
              p.testName?.toLowerCase()?.indexOf(q) > -1 ||
              p.testShortName?.toLowerCase()?.indexOf(q) > -1
          );
          if (p.tests.length == 0) return null;
          return p;
        })
        .filter((p) => p != null);
    }
    groupValues.sort((a, b) => b.tests.length - a.tests.length);
    return groupValues;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchString]);

  const onTestCheckboxChanges = (checked: boolean, testConfig: TestConfig) => {
    let newSelected = { ...selected };
    if (checked) {
      newSelected[testConfig.uuid] = testConfig;
    } else {
      if (newSelected[testConfig.uuid]) {
        delete newSelected[testConfig.uuid];
      }
    }
    setSelected(newSelected);
  };

  const handleSearch = useMemo(
    () =>
      debounce((e) => {
        setSearchString(e.target.value);
      }, 300),
    []
  );

  return (
    <div className={`fullScreenModal ${styles.modalWrapper}`}>
      <ModalHeader
        closeModal={closeModal}
        title={t("laboratoryTestSelection", "Laboratory Test Selection")}
      >
        <Search
          autofocus
          labelText=""
          placeholder={t("laboratoryFilterTests", "Filter tests")}
          onChange={handleSearch}
          size={"sm"}
        />
      </ModalHeader>
      <ModalBody className={styles.modalBody}>
        <section className={styles.section}>
          {testGroups.map((testGroup) => (
            <Tile
              className={styles.testGroup}
              key={testGroup.tests[0].testGroupUuid}
            >
              <h6>{testGroup.group}</h6>
              {testGroup.tests.map((test) => (
                <Checkbox
                  checked={selected[test.uuid]}
                  onChange={(e) =>
                    onTestCheckboxChanges(e.target.checked, test)
                  }
                  className={styles.testGroupItem}
                  labelText={
                    test?.testShortName
                      ? `${test?.testShortName}${
                          test?.testName ? ` (${test.testName})` : ""
                        }`
                      : test?.testName
                  }
                  id={`test-chk-${test.uuid}`}
                />
              ))}
            </Tile>
          ))}
        </section>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t("cancel", "Cancel")}
        </Button>
        <Button
          type="submit"
          onClick={() => onSelectionComplete(Object.values(selected))}
        >
          {t("Continue", "Continue")}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default LabRequestTestSelect;
