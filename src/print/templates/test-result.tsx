import { LoggedInUser } from "@openmrs/esm-framework";
import { TestRequest } from "../../api/types/test-request";
import { formatTestName } from "../../components/test-name";
import { Config } from "../../config-schema";
import { Patient } from "../../types";
import { formatDisplayDateTime } from "../../utils/date-utils";
import {
  formatHealthCenterName,
  GetHeaderSection,
  GetPrintTemplate,
} from "../print-template";
import { printDocument } from "../print-utils";
import { TestRequestItem } from "../../api/types/test-request-item";
import dayjs from "dayjs";
import { getTestResultAsString } from "../../components/test-request/test-result-info.component";
import { TestApproval } from "../../api/types/test-approval";
import { TestResult } from "../../api/types/test-result";

const formatResultBy = (testResult: TestResult) => {
  return `<div>Reviewed By <b>${`${testResult?.resultByFamilyName ?? ""} ${
    testResult?.resultByMiddleName ?? ""
  } ${
    testResult?.resultByGivenName ?? ""
  }`}</b></div><div style="white-space:nowrap;">${formatDisplayDateTime(
    testResult?.resultDate
  )}</div>`;
};

const formatApproverInfo = (approval: TestApproval) => {
  return `<div>Reviewed By <b>${`${approval?.approvedByFamilyName ?? ""} ${
    approval?.approvedByMiddleName ?? ""
  } ${
    approval?.approvedByGivenName ?? ""
  }`}</b></div><div style="white-space:nowrap;">${formatDisplayDateTime(
    approval?.approvalDate
  )}</div>`;
};

const formatTestResults = (
  testRequest: TestRequest,
  tests: Array<TestRequestItem>
) => {
  let testResultStr =
    tests
      ?.map((test) => {
        return {
          name: formatTestName(test.testName, test.testShortName),
          test: test,
        };
      })
      ?.sort((x, y) =>
        (x?.name?.toLocaleLowerCase() ?? "").localeCompare(
          y?.name?.toLocaleLowerCase() ?? "",
          undefined,
          {
            ignorePunctuation: true,
          }
        )
      )
      ?.map((test) => {
        return `<tr>
            <td colspan="4" valign="middle" style="padding-top: 4pt;padding-bottom: 4pt;">
            <div style="display:flex;justify-content:space-between;align-items:center;"><div style="flex-grow:1"><div><b>${
              test.name ?? ""
            }</b></div>${
          test?.test?.testResult?.remarks
            ? `<span class="test-remarks">${test?.test?.testResult?.remarks}</span>`
            : ""
        }</div>${
          test?.test?.testResult?.approvals?.some(
            (p) => p.approvalResult == "APPROVED"
          )
            ? `<div style="text-align: right;display:flex;align-items:center;flex-direction:column;justify-content:flex-end;">${formatApproverInfo(
                test?.test?.testResult?.approvals?.find(
                  (p) => p.approvalResult == "APPROVED"
                )
              )}</div>`
            : `<div style="text-align: right;display:flex;align-items:center;flex-direction:column;justify-content:flex-end;">${formatResultBy(
                test?.test?.testResult
              )}</div>`
        }
            </div></td>                    
        </tr>${getTestResultAsString(
          test?.test?.testResult,
          test?.test?.testConcept
        )}`;
      })
      ?.join("") ?? "";
  if (!testResultStr) return "";
  return `<table class="table-data" border="0" cellspacing="0" cellpadding="0">                     
        <tr>
            <th valign="middle" class="left" style="border-top:solid black 1.0pt;"><b>Test</b></th>
            <th valign="middle" style="border-top:solid black 1.0pt;"><b>Result</b></th>
            <th valign="middle" style="border-top:solid black 1.0pt;"><b>Ranges</b></th>
            <th valign="middle" class="left" style="border-top:solid black 1.0pt;"><b>Unit</b></th>             
        </tr>
        ${testResultStr}
      </table>`;
};

const formatReferredInTestResults = (
  data: TestRequest,
  translator: (key: string, defaultValue: string) => string
) => {
  return (
    data?.samples
      .map((p) => {
        let testsToPrint = data?.tests?.filter((x) =>
          x.samples?.some((y) => y.uuid == p.uuid)
        );
        if ((testsToPrint?.length ?? 0) == 0) return "";
        return `
        <div style="margin-left:6.95pt;"><b>${translator(
          "type",
          "Type"
        )}:</b> ${p.sampleTypeName ?? ""} | <b>${translator(
          "external",
          "External"
        )}:</b> ${p.externalRef ?? ""} | <b>${translator(
          "internal",
          "Internal"
        )}:</b> ${p.accessionNumber ?? ""}</div>
        ${formatTestResults(data, testsToPrint)}`;
      })
      .join("") ?? ""
  );
};

export const FormatTestResultDocument = async (
  laboratoryConfig: Config,
  patient: Patient,
  data: TestRequest,
  itemsToPrint: Array<string>,
  currentUser: LoggedInUser,
  translator: (key: string, defaultValue: string) => string
): Promise<string> => {
  const reportedDate = data?.tests
    ?.map((p) => {
      return [
        p.testResult?.completedDate
          ? dayjs(p.testResult?.completedDate).toDate()
          : null,
        p.testResult?.resultDate
          ? dayjs(p.testResult?.resultDate).toDate()
          : null,
      ];
    })
    .flatMap((p) => p)
    .filter((p) => p)
    .reduce((x, y) => {
      if (x == null) return y;
      return y.getTime() > x.getTime() ? y : x;
    }, null);
  let headerSection = await GetHeaderSection(
    laboratoryConfig?.laboratoryPrintLogoUri,
    laboratoryConfig?.laboratoryPrintLogoText,
    `
<div class="header-content">
  ${formatHealthCenterName(laboratoryConfig?.laboratoryHealthCenterName)}
</div>
        `
  );
  return ` 
  <table border="0" cellspacing="0" cellpadding="0" style="width:100%;border-bottom: none;border: none;margin-bottom:0;">
    <thead>
      <tr>
        <td  style="width:100%;border-bottom: none;border: none;">
          <div class="page-header-space"  style="width:100%;border-bottom: none;border: none;">
            ${headerSection}          
            <div class="heading text" style="text-align: center;padding-bottom: 0.6rem;text-transform: uppercase;font-weight: bold;">
                <span>Laboratory Results</span>
            </div>
          </div>
        </td>
      </tr>
    </thead>
    <tbody class="main-tbody">
      <tr>
        <td style="width:100%;border-bottom: none;border: none;">    
        
        <table style="width:99%" class="table-data field-label-nowrap" border="0" cellspacing="0" cellpadding="0">            
          <tr>
              <td style="text-align: left;width: 10%;border-top:solid black 1.0pt;" class="field-label">Name:</td>
              <td style="text-align: left;width: 40%;border-top:solid black 1.0pt;" class="field-value">${
                data?.referralFromFacilityName ??
                `${data?.patientFamilyName ?? ""} ${
                  data?.patientMiddleName ?? ""
                } ${data?.patientGivenName ?? ""}`
              }</td>
              <td style="text-align: left;width: 10%;border-top:solid black 1.0pt;" class="field-label">Age:</td>
              <td style="text-align: left;width: 40%;border-top:solid black 1.0pt;" class="field-value">${
                data?.referredIn
                  ? "N/A"
                  : `${
                      patient?.person?.age
                        ? `${patient?.person?.age} yrs`
                        : `Unknown`
                    }  |  <b>Gender:</b> ${
                      patient?.person?.gender === "M"
                        ? " Male"
                        : patient?.person?.gender === "F"
                        ? " Female"
                        : patient?.person?.gender ?? "Unknown"
                    }`
              }</td>
          </tr>
          <tr>
              <td style="text-align: left;width: 10%;" class="field-label">Identifier:</td>
              <td style="text-align: left;width: 40%;" class="field-value">${
                data?.referralInExternalRef ?? data?.patientIdentifier
              }</td>
              <td style="text-align: left;width: 10%;" class="field-label">Request No:</td>
              <td style="text-align: left;width: 40%;" class="field-value">${
                data?.requestNo
              }</td>
          </tr>
          <tr>
              <td style="text-align: left;width: 10%;" class="field-label">Received:</td>
              <td style="text-align: left;width: 40%;" class="field-value">
              <div>${data?.atLocationName}</div> 
              ${formatDisplayDateTime(data?.dateCreated)}</td>
              <td style="text-align: left;width: 10%;" class="field-label">Reported:</td>
              <td style="text-align: left;width: 40%;" class="field-value">${formatDisplayDateTime(
                reportedDate
              )}</td>
          </tr>
          <tr>
              <td style="text-align: left;width: 10%;" class="field-label">Requested By:</td>
              <td style="text-align: left;width: 40%;" class="field-value">${
                data?.referredIn
                  ? "Referral"
                  : `${data?.providerFamilyName ?? ""} ${
                      data?.providerMiddleName ?? ""
                    } ${data?.providerGivenName ?? ""}`
              }</td>
              <td style="text-align: left;width: 10%;" class="field-label">Submitted By:</td>
              <td style="text-align: left;width: 40%;" class="field-value">${
                data?.creatorFamilyName ?? ""
              } ${data?.creatorGivenName ?? ""}</td>
          </tr>
          <tr>
              <td style="text-align: left;" colspan="4" class="field-label">Tests Requested</td>
          </tr>
          <tr>
              <td style="text-align: left;white-space:wrap;" colspan="4" class="field-value">${Object.entries(
                data?.tests?.reduce((x, y) => {
                  x[formatTestName(y.testName, y.testShortName)] = true;
                  return x;
                }, {})
              )
                .map(([k, v]) => k)
                .sort((x, y) =>
                  (x?.toLocaleLowerCase() ?? "").localeCompare(
                    y?.toLocaleLowerCase() ?? "",
                    undefined,
                    {
                      ignorePunctuation: true,
                    }
                  )
                )
                .join(", ")}</td>
          </tr>
        </table>
      <table style="width:99%;margin-left:6.95pt;margin-bottom:0.5rem;border-bottom:none;" border="0" cellspacing="0" cellpadding="0">
          <tr>
              <td style="text-align: center;border-bottom:none;padding-bottom:0.6rem;">
                  <b><span>TESTS RESULTS</span></b>
              </td>
          </tr>
      </table>
      ${
        (data.referredIn
          ? formatReferredInTestResults(data, translator)
          : formatTestResults(data, data?.tests)) ?? ""
      }      
      <div style="margin: 10px;display: flex;width: 100%;flex-direction: "row";">
          <span style="fontSize: 14px;margin-top: 20px;">Sign : .............................................&nbsp;
            <span style="fontSize: 14px;marginLeft: 50px;">Date : ............................</span>
          </span>
        </div>
    </td>
   </tr> 
  </tbody>
  <tfoot>
    <tr>
      <td  style="width:100%;border-bottom: none;border: none;">          
        <div class="page-footer-space">
            <div style="display:flex;flex-direction:row;align-items:center;justify-content:space-between;">
                <div>${data?.requestNo}: ${
    data?.referralFromFacilityName ??
    `${data?.patientFamilyName ?? ""} ${data?.patientMiddleName ?? ""} ${
      data?.patientGivenName ?? ""
    }`
  }</div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;justify-content:flex-end;flex-grow:1;">
                  <div>Printed Date: ${formatDisplayDateTime(new Date())}</div>
                  <div>Printed By: ${currentUser?.person?.display ?? ""}</div>
                </div>
            </div>
        </div>
      </td>
    </tr>
  </tfoot>

</table>

</body>

</html> 
    `;
};

export const PrintTestResult = async (
  laboratoryConfig: Config,
  patient: Patient,
  data: TestRequest,
  itemsToPrint: Array<string>,
  currentUser: LoggedInUser,
  translator: (key: string, defaultValue?: string) => string
) => {
  let printData = await FormatTestResultDocument(
    laboratoryConfig,
    patient,
    data,
    itemsToPrint,
    currentUser,
    translator
  );
  printDocument(
    GetPrintTemplate(
      printData,
      `Laboratory Results: ${data?.requestNo ?? ""}`,
      true,
      laboratoryConfig?.laboratoryCloseAfterPrint ?? true
    )
  );
};
