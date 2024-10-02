import React from "react";
import { TestResult } from "../../api/types/test-result";
import styles from "./test-result-info.scss";
import { useTranslation } from "react-i18next";
import { Concept } from "../../api/types/concept/concept";
import { Observation } from "../../api/types/Observation";
import { formatDateTimeForDisplay } from "../../utils/date-utils";
import { isNumericValue } from "../../results/result-field";
import { URL_API_TEST_REST_ATTACHMENT_DOWNLOAD } from "../../config/urls";

export interface ITestResultInfo {
  testResult: TestResult;
  testConcept: Concept;
}

export const getValueUnitsAsStrig = (concept: Concept) => {
  return concept?.units ?? "N/A";
};

export const getReferenceRangeAsString = (concept: Concept) => {
  const lowNormal = isNumericValue(concept?.lowNormal)
    ? concept?.lowNormal
    : "--";
  const hiNormal = isNumericValue(concept?.hiNormal) ? concept?.hiNormal : "--";

  return !isNumericValue(concept?.hiNormal) ||
    !isNumericValue(concept?.lowNormal)
    ? "N/A"
    : `${lowNormal} : ${hiNormal}`;
};

export const getRowGroupMembersAsString = (
  groupMembers: Array<Observation>,
  testConcept: Concept,
  hasRemarks: boolean
) => {
  const getConcept = (uuid: string) => {
    if (testConcept?.uuid == uuid) return testConcept;
    return (
      testConcept?.setMembers?.find((p) => p.uuid == uuid) ??
      testConcept?.answers?.find((p) => p.uuid == uuid)
    );
  };

  let lastElementIndex = (groupMembers?.length ?? 0) - 1;
  return (
    groupMembers
      ?.map((element, elementIndex) => {
        let elementConcept = getConcept(element?.concept?.uuid);
        return `
<tr class="data-row">
  <td valign="middle" style="text-align:left; white-space: nowrap;${
    lastElementIndex == elementIndex ? "border-bottom-style:double;" : ""
  }">${element?.concept.display ?? ""}</td>
  <td valign="middle" style="text-align:center;${
    lastElementIndex == elementIndex ? "border-bottom-style:double;" : ""
  }">${
          typeof element.value === "object"
            ? element.value.display
            : element.value
        }
  </td>                    
  <td valign="middle" style="text-align:center;${
    lastElementIndex == elementIndex ? "border-bottom-style:double;" : ""
  }">${getReferenceRangeAsString(elementConcept) ?? ""}</td>                    
  <td valign="middle" style="text-align:center;${
    lastElementIndex == elementIndex ? "border-bottom-style:double;" : ""
  }">${getValueUnitsAsStrig(elementConcept) ?? ""}</td>   
</tr>`;
      })
      ?.join("") ?? ""
  );
};

export const getTestResultAsString = (
  testResult: TestResult,
  testConcept: Concept
) => {
  let result = "";
  let hasGroupMembers = testResult?.obs?.groupMembers?.length > 0;

  if (
    testResult?.obs?.value != null &&
    typeof testResult?.obs?.value != "undefined"
  ) {
    result = `
<tr class="data-row">
  <td valign="middle" style="text-align:left; white-space: nowrap;${
    !hasGroupMembers
      ? "border-style-bottom:double;border-style-top:double;"
      : ""
  }">${testResult?.obs?.order?.display ?? ""}</td>
  <td valign="middle" style="text-align:center;${
    !hasGroupMembers
      ? "border-style-bottom:double;border-style-top:double;"
      : ""
  }">${(testResult?.obs?.value as any)?.display ?? testResult?.obs?.value}
  </td>                    
  <td valign="middle" style="text-align:center;${
    !hasGroupMembers
      ? "border-style-bottom:double;border-style-top:double;"
      : ""
  }">${getReferenceRangeAsString(testConcept) ?? ""}</td>                    
  <td valign="middle" style="text-align:center;${
    !hasGroupMembers
      ? "border-style-bottom:double;border-style-top:double;"
      : ""
  }">${getValueUnitsAsStrig(testConcept) ?? ""}</td>   
</tr>`;
  }

  return `${result}${
    hasGroupMembers
      ? getRowGroupMembersAsString(
          testResult?.obs?.groupMembers,
          testConcept,
          !!testResult?.remarks
        )
      : ""
  }`;
};

const TestResultInfo: React.FC<ITestResultInfo> = ({
  testResult,
  testConcept,
}) => {
  const { t } = useTranslation();

  // get Units
  const ValueUnits = ({ concept }: { concept: Concept }) => {
    return (
      <span className={styles.valueWidget}>{concept?.units ?? "N/A"}</span>
    );
  };

  // get Reference Range
  const ReferenceRange = ({ concept }: { concept: Concept }) => {
    const lowNormal = isNumericValue(concept?.lowNormal)
      ? concept?.lowNormal
      : "--";
    const hiNormal = isNumericValue(concept?.hiNormal)
      ? concept?.hiNormal
      : "--";

    return (
      <>
        {!isNumericValue(concept?.hiNormal) ||
        !isNumericValue(concept?.lowNormal) ? (
          "N/A"
        ) : (
          <div>
            <span>{lowNormal}</span> : <span>{hiNormal}</span>
          </div>
        )}
      </>
    );
  };

  const RowGroupMembers = ({
    groupMembers,
    testConcept,
  }: {
    groupMembers: Array<Observation>;
    testConcept: Concept;
  }) => {
    const getConcept = (uuid: string) => {
      if (testConcept?.uuid == uuid) return testConcept;
      return (
        testConcept?.setMembers?.find((p) => p.uuid == uuid) ??
        testConcept?.answers?.find((p) => p.uuid == uuid)
      );
    };

    return (
      <>
        {groupMembers?.map((element, index) => (
          <tr key={index} style={{ height: "0.5rem" }}>
            <td style={{ whiteSpace: "nowrap !important" }}>
              {element?.concept.display}
            </td>
            <td>
              {typeof element.value === "object"
                ? element.value.display
                : element.value}
            </td>
            <td>
              <ReferenceRange concept={getConcept(element?.concept?.uuid)} />
            </td>
            <td>
              <ValueUnits concept={getConcept(element?.concept?.uuid)} />
            </td>
          </tr>
        ))}
      </>
    );
  };

  return (
    <div className={styles.results}>
      <section className={styles.section}>
        {testResult?.obs ? (
          <div>
            <div>
              {t("resultsBy", "Results by")}{" "}
              <strong>
                {testResult?.resultByFamilyName ?? ""}{" "}
                {testResult?.resultByMiddleName ?? ""}{" "}
                {testResult?.resultByGivenName ?? ""}{" "}
              </strong>
              {t("on", "On")}
              <strong>
                {" "}
                {formatDateTimeForDisplay(testResult?.resultDate)}{" "}
              </strong>
              {testResult?.atLocationName && (
                <>
                  {" "}
                  {t("at", "At")}
                  <strong> {testResult?.atLocationName}</strong>
                </>
              )}
            </div>
            {testResult?.obs?.display}
            {testResult?.remarks && (
              <div>
                <h6>Remarks:</h6>
                {testResult.remarks ?? ""}
              </div>
            )}
            {testResult?.hasAttachment && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  columnGap: "0.5rem",
                  width: "100%",
                  whiteSpace: "nowrap",
                }}
              >
                <h6>{t("laboratoryTestResultFile", "Test Result File")}:</h6>
                <a
                  target="_blank"
                  href={URL_API_TEST_REST_ATTACHMENT_DOWNLOAD(testResult.uuid)}
                >
                  <strong>Download</strong>
                </a>
              </div>
            )}
            <table>
              <thead>
                <tr style={{ height: "0.5rem" }}>
                  <th style={{ height: "0.5rem" }}>Tests</th>
                  <th style={{ height: "0.5rem" }}>Result</th>
                  <th style={{ height: "0.5rem" }}>Reference Range</th>
                  <th style={{ height: "0.5rem" }}>Units</th>
                </tr>
              </thead>
              <tbody>
                {testResult?.obs?.value != null &&
                  typeof testResult?.obs?.value != "undefined" && (
                    <tr style={{ height: "0.5rem" }}>
                      <td style={{ whiteSpace: "nowrap !important" }}>
                        <span>{testResult?.obs?.order?.display}</span>
                      </td>
                      <td>
                        <span>
                          {(testResult?.obs?.value as any)?.display ??
                            testResult?.obs?.value}
                        </span>
                      </td>
                      <td>
                        <span>
                          <ReferenceRange concept={testConcept} />
                        </span>
                      </td>
                      <td>
                        <span>
                          <ValueUnits concept={testConcept} />
                        </span>
                      </td>
                    </tr>
                  )}
                {testResult?.obs?.groupMembers?.length > 0 && (
                  <RowGroupMembers
                    groupMembers={testResult?.obs?.groupMembers}
                    testConcept={testConcept}
                  />
                )}
              </tbody>
            </table>
          </div>
        ) : (
          "No test results"
        )}
      </section>
    </div>
  );
};

export default TestResultInfo;
