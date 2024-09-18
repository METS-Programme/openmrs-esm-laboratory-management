import { LoggedInUser } from "@openmrs/esm-framework";
import { TestRequest } from "../../api/types/test-request";
import { User } from "../../api/types/user";
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
import {
  ReferralOutOriginProvider,
  TestRequestItemStatusCancelled,
  TestRequestItemStatusReferredOutProvider,
} from "../../api/types/test-request-item";

export const FormatTestRequestDocument = async (
  laboratoryConfig: Config,
  patient: Patient,
  data: TestRequest,
  itemsToPrint: Array<string>,
  currentUser: LoggedInUser,
  translator: (key: string, defaultValue: string) => string
): Promise<string> => {
  let headerSection = await GetHeaderSection(
    laboratoryConfig?.laboratoryPrintLogoUri,
    laboratoryConfig?.laboratoryPrintLogoText,
    `
<div class="header-content">
  ${formatHealthCenterName(laboratoryConfig?.laboratoryHealthCenterName)}
</div>
        `
  );
  return ` <table border="0" cellspacing="0" cellpadding="0" style="width:100%;border-bottom: none;border: none;margin-bottom:0;">
    <thead>
      <tr>
        <td  style="width:100%;border-bottom: none;border: none;">
          <div class="page-header-space"  style="width:100%;border-bottom: none;border: none;">${headerSection}         
            <div class="heading text" style="text-align: center;padding-bottom: 0.6rem;text-transform: uppercase;font-weight: bold;">
                <span>Laboratory Request</span>
            </div></div>
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
              <td style="text-align: left;width: 10%;" class="field-label">Location:</td>
              <td style="text-align: left;width: 40%;" class="field-value">${
                data?.atLocationName
              }</td>
              <td style="text-align: left;width: 10%;" class="field-label">Received:</td>
              <td style="text-align: left;width: 40%;" class="field-value">${formatDisplayDateTime(
                data?.dateCreated
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
        </table>
      <table style="width:99%;margin-left:6.95pt;margin-bottom:0.5rem;border-bottom:none;" border="0" cellspacing="0" cellpadding="0">
          <tr>
              <td style="text-align: ${
                data?.referredIn
                  ? "center;border-bottom:none;padding-bottom:0.6rem;"
                  : "left;border-bottom:solid black 1.0pt;"
              }">
                  <b><span>TESTS REQUESTED</span></b>
              </td>
          </tr>
      </table>
        ${
          data?.referredIn
            ? `
        <table class="table-data" border="0" cellspacing="0" cellpadding="0">                     
            <tr>
              ${
                data?.referredIn
                  ? `<th valign="middle" class="left" style="border-top:solid black 1.0pt;"><b>Sample Type</b></th>
                <th valign="middle" style="border-top:solid black 1.0pt;"><b>Sample Reference</b></th>
                <th valign="middle" style="border-top:solid black 1.0pt;"><b>Internal Reference</b></th>`
                  : `<th valign="middle" class="left" style="border-top:solid black 1.0pt;"><b>Test</b></th>`
              }                
            </tr>            
            ${
              data?.referredIn
                ? data?.samples
                    .map((p) => {
                      let testsToPrint = data?.tests
                        ?.filter(
                          (p) =>
                            !itemsToPrint ||
                            itemsToPrint.length == 0 ||
                            itemsToPrint.includes(p.uuid)
                        )
                        ?.filter((x) =>
                          x.samples?.some((y) => y.uuid == p.uuid)
                        )
                        ?.map((test) =>
                          formatTestName(test.testName, test.testShortName)
                        )
                        ?.sort((x, y) =>
                          (x?.toLocaleLowerCase() ?? "").localeCompare(
                            y?.toLocaleLowerCase() ?? "",
                            undefined,
                            {
                              ignorePunctuation: true,
                            }
                          )
                        );

                      let testsToPrintStr = testsToPrint
                        ?.map(
                          (test, testIndex) => `<tr>
                      <td colspan="3" valign="middle"  ${
                        testIndex < testsToPrint.length - 1
                          ? 'style="border-bottom:none;border-top:none;"'
                          : 'style="border-top:none;"'
                      }>${testIndex + 1}. ${test}</td>                    
                  </tr> `
                        )
                        .join("");
                      if (!testsToPrintStr) return "";
                      return `
                <tr class="data-row">
                    <td valign="middle" style="text-align:left;border-right:none;border-bottom:none;">${
                      p.sampleTypeName ?? ""
                    }</td>
                    <td valign="middle" style="text-align:center;border-left:none;border-right:none;border-bottom:none;">${
                      p.externalRef ?? ""
                    }</td>                    
                    <td valign="middle" style="text-align:center;border-left:none;border-bottom:none;">${
                      p.accessionNumber ?? ""
                    }</td>  
                </tr>
                ${testsToPrintStr}`;
                    })
                    .join("") ?? ""
                : ""
            }                   
        </table>`
            : `<ol>${
                data?.tests
                  ?.filter(
                    (p) =>
                      !itemsToPrint ||
                      itemsToPrint.length == 0 ||
                      itemsToPrint.includes(p.uuid)
                  )
                  ?.map(
                    (test) =>
                      `<li>${formatTestName(
                        test.testName,
                        test.testShortName
                      )}${
                        (test.referredOut &&
                          test.referralOutOrigin ==
                            ReferralOutOriginProvider) ||
                        test.status == TestRequestItemStatusCancelled
                          ? ` (${[
                              test.referredOut &&
                              test.referralOutOrigin ==
                                ReferralOutOriginProvider
                                ? translator(
                                    TestRequestItemStatusReferredOutProvider,
                                    "Referred Out"
                                  )
                                : null,
                              test.status == TestRequestItemStatusCancelled
                                ? translator("Cancelled", "Cancelled")
                                : null,
                            ]
                              .filter((p) => p)
                              .join(", ")})`
                          : ""
                      }</li>`
                  )
                  ?.join("") ?? ""
              }</ol>`
        }
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
                    <div>Printed Date: ${formatDisplayDateTime(
                      new Date()
                    )}</div>
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

export const PrintTestRequest = async (
  laboratoryConfig: Config,
  patient: Patient,
  data: TestRequest,
  itemsToPrint: Array<string>,
  currentUser: LoggedInUser,
  translator: (key: string, defaultValue?: string) => string
) => {
  let printData = await FormatTestRequestDocument(
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
      `Laboratory Request: ${data?.requestNo ?? ""}`,
      true,
      laboratoryConfig?.laboratoryCloseAfterPrint ?? true
    )
  );
};
