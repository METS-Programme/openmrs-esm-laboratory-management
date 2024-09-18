import { restBaseUrl } from "@openmrs/esm-framework";

export const BASE_OPENMRS_APP_URL = window.openmrsBase;
export const BASE_OPENMRS_APP_SPA_URL = window["getOpenmrsSpaBase"]();
export const MODULE_BASE_URL = `${BASE_OPENMRS_APP_SPA_URL}${
  BASE_OPENMRS_APP_SPA_URL.endsWith("/") ? "" : "/"
}home/laboratory`;
export const ROUTING_BASE_URL = "/";
export const URL_LAB_HOME = ROUTING_BASE_URL;

export const URL_API_IDENTIFIER_SOURCE = `${restBaseUrl}/idgen/identifiersource`;
export const GetGenerateIdentifierApiUrl = (sourceUuid) =>
  `${URL_API_IDENTIFIER_SOURCE}/${sourceUuid}/identifier`;

export const URL_LAB_CONFIGURATION = `${ROUTING_BASE_URL}settings`;
export const URL_LAB_CONFIGURATION_ABS = `${MODULE_BASE_URL}${ROUTING_BASE_URL}settings`;
export const URL_LAB_OPENMRS_SETTINGS = `${BASE_OPENMRS_APP_URL}/admin/maintenance/settings.list?show=Labmanagement`;

export const URL_LAB_REFERRAL = `${ROUTING_BASE_URL}referral`;
export const URL_LAB_REFERRAL_ABS = `${MODULE_BASE_URL}${ROUTING_BASE_URL}referral`;

export const URL_LAB_REQUESTS_PENDING_APPROVAL = `${ROUTING_BASE_URL}requests-pending-approval`;
export const URL_LAB_REQUESTS_PENDING_APPROVAL_ABS = `${MODULE_BASE_URL}${URL_LAB_REQUESTS_PENDING_APPROVAL}`;

export const URL_LAB_REQUESTS_ALL = `${ROUTING_BASE_URL}requests-all`;
export const URL_LAB_REQUESTS_ALL_PATH = `${URL_LAB_REQUESTS_ALL}/*`;
export const URL_LAB_REQUESTS_ALL_ABS = `${MODULE_BASE_URL}${URL_LAB_REQUESTS_ALL}`;
export const URL_LAB_REQUESTS_ALL_SUMMARY = `${URL_LAB_REQUESTS_ALL}/summary`;
export const URL_LAB_REQUESTS_ALL_SUMMARY_ABS = `${MODULE_BASE_URL}${URL_LAB_REQUESTS_ALL_SUMMARY}`;
export const URL_LAB_REQUESTS_ALL_ABS_REQUEST_NO = (
  requestNo: string,
  startDate: string
) =>
  `${URL_LAB_REQUESTS_ALL_ABS}?requestNo=${requestNo}${
    startDate == null || typeof startDate == "undefined"
      ? ""
      : `&startDate=${startDate}`
  }`;

export const URL_LAB_REQUESTS_REJECTED_APPROVAL = `${ROUTING_BASE_URL}requests-not-approved`;
export const URL_LAB_REQUESTS_REJECTED_APPROVAL_ABS = `${MODULE_BASE_URL}${URL_LAB_REQUESTS_REJECTED_APPROVAL}`;

export const URL_LAB_REQUESTS_APPROVED = `${ROUTING_BASE_URL}requests-approved`;
export const URL_LAB_REQUESTS_APPROVED_ABS = `${MODULE_BASE_URL}${URL_LAB_REQUESTS_APPROVED}`;

export const URL_LAB_REQUESTS_REFERRED_APPROVAL = `${ROUTING_BASE_URL}requests-referred-out`;
export const URL_LAB_REQUESTS_REFERRED_APPROVAL_ABS = `${MODULE_BASE_URL}${URL_LAB_REQUESTS_REFERRED_APPROVAL}`;

export const URL_LAB_SAMPLES = `${ROUTING_BASE_URL}samples`;
export const URL_LAB_SAMPLES_PATH = `${URL_LAB_SAMPLES}/*`;
export const URL_LAB_SAMPLES_ABS = `${MODULE_BASE_URL}${URL_LAB_SAMPLES}`;
export const URL_LAB_SAMPLES_HISTORY = `${URL_LAB_SAMPLES}/history`;
export const URL_LAB_SAMPLES_HISTORY_ABS = `${MODULE_BASE_URL}${URL_LAB_SAMPLES_HISTORY}`;
export const URL_LAB_SAMPLES_REPOSITORY = `${URL_LAB_SAMPLES}/repository`;
export const URL_LAB_SAMPLES_REPOSITORY_ABS = `${MODULE_BASE_URL}${URL_LAB_SAMPLES_REPOSITORY}`;

export const URL_LAB_WORKLIST = `${ROUTING_BASE_URL}worklist`;
export const URL_LAB_WORKLIST_PATH = `${ROUTING_BASE_URL}worklist/*`;
export const URL_LAB_WORKLIST_ABS = `${MODULE_BASE_URL}${URL_LAB_WORKLIST}`;
export const URL_LAB_WORKLIST_REQUESTS = `${ROUTING_BASE_URL}worklist/requests`;
export const URL_LAB_WORKLIST_REQUESTS_ABS = `${MODULE_BASE_URL}${URL_LAB_WORKLIST_REQUESTS}`;
export const URL_LAB_WORKSHEET = `${ROUTING_BASE_URL}worklist/worksheets`;
export const URL_LAB_WORKSHEET_ABS = `${MODULE_BASE_URL}${URL_LAB_WORKSHEET}`;
export const URL_LAB_WORKSHEET_NEW = `${ROUTING_BASE_URL}worklist/worksheets/new`;
export const URL_LAB_WORKSHEET_NEW_ABS = `${MODULE_BASE_URL}${URL_LAB_WORKSHEET_NEW}`;
export const URL_LAB_WORKSHEET_VIEW = (uuid: string) =>
  `${ROUTING_BASE_URL}worklist/worksheets/${uuid}`;
export const URL_LAB_WORKSHEET_VIEW_ABS = (uuid: string) =>
  `${MODULE_BASE_URL}${URL_LAB_WORKSHEET_VIEW(uuid)}`;

export const URL_LAB_TESTS_ORDERED = `${ROUTING_BASE_URL}tests-ordered`;
export const URL_LAB_TESTS_ORDERED_ABS = `${MODULE_BASE_URL}${URL_LAB_TESTS_ORDERED}`;

export const URL_LAB_EXTENSION_URL = (extenstion: string) =>
  `${ROUTING_BASE_URL}${extenstion}`;
export const URL_LAB_EXTENSION_URL_ABS = (extenstion: string) =>
  `${MODULE_BASE_URL}${URL_LAB_EXTENSION_URL(extenstion)}`;

export const URL_TEST_CONFIG_IMPORT_ERROR_FILE = (importSessionId: string) =>
  `${BASE_OPENMRS_APP_URL}${restBaseUrl}/labmanagement/test-config-import?id=${importSessionId}`;
export const URL_IMPORT_TEMPLATE_FILE = `${BASE_OPENMRS_APP_URL}${restBaseUrl}/labmanagement/test-config-import-template`;

export const URL_API_TEST_CONFIG = `${restBaseUrl}/labmanagement/test-config`;
export const URL_API_TEST_CONFIG_IMPORT = `${restBaseUrl}/labmanagement/test-config-import`;

export const URL_API_TEST_REQUEST = `${restBaseUrl}/labmanagement/test-request`;
export const URL_API_TEST_REQUEST_ACTION = `${restBaseUrl}/labmanagement/test-request-action`;

export const URL_API_TEST_REQUEST_ITEMS = `${restBaseUrl}/labmanagement/test-request-item`;
export const URL_API_SAMPLE_ACTIVITY = `${restBaseUrl}/labmanagement/sample-activity`;

export const URL_API_WORKSHEET = `${restBaseUrl}/labmanagement/worksheet`;
export const URL_API_WORKSHEET_URL = (worksheetUuid: string) =>
  `${restBaseUrl}/labmanagement/worksheet/${worksheetUuid}`;
export const URL_API_WORKSHEET_ITEM = `${restBaseUrl}/labmanagement/worksheet-item`;
export const URL_API_WORKSHEET_TESTRESULTS_URL = `${restBaseUrl}/labmanagement/worksheet-test-result`;

export const URL_API_SAMPLE = `${restBaseUrl}/labmanagement/sample`;

export const URL_API_ORDER = `${restBaseUrl}/order`;

export const URL_API_ENCOUNTER = `${restBaseUrl}/encounter`;

export const URL_API_APPROVAL_FLOW = `${restBaseUrl}/labmanagement/approval-flow`;
export const URL_API_APPROVAL_CONFIG = `${restBaseUrl}/labmanagement/approval-config`;
export const URL_API_DASHBOARD_METRICS = `${restBaseUrl}/labmanagement/dashboard-metrics`;

export const URL_API_REFERRER_LOCATION = `${restBaseUrl}/labmanagement/referral-location`;

export const URL_API_UGEMR_GENERATE_SAMPLE_BARCODE = (orderUuid?: string) =>
  `${restBaseUrl}/generatesampleId?uuid=${orderUuid ?? ""}`;

export const URL_API_LAB_LOCATION = (uuid) =>
  `${restBaseUrl}/labmanagement/location/${uuid}`;
export const URL_API_LOCATION = `${restBaseUrl}/location`;
export const URL_API_LOCATION_URL = (uuid) => `${restBaseUrl}/location/${uuid}`;
export const URL_LOCATIONS_NEW = () =>
  `${BASE_OPENMRS_APP_URL}/admin/locations/location.form`;
export const URL_LOCATIONS_EDIT = (id: number) =>
  `${BASE_OPENMRS_APP_URL}/admin/locations/location.form?locationId=${id}`;
export const URL_OPENMRS_LABMANAGEMENT_SETTINGS = `${BASE_OPENMRS_APP_URL}/admin/maintenance/settings.list?show=Labmanagement`;

export const URL_API_LOCATION_TAG = `${restBaseUrl}/locationtag`;

export const URL_API_TESTRESULT = `${restBaseUrl}/labmanagement/test-result`;
export const URL_API_TESTRESULT_URL = (testResultUuid: string) =>
  `${restBaseUrl}/labmanagement/test-result/${testResultUuid}`;

export const URL_LAB_RESULTS_APPROVAL = `${ROUTING_BASE_URL}approval`;
export const URL_LAB_RESULTS_APPROVAL_PATH = `${ROUTING_BASE_URL}approval/*`;
export const URL_LAB_RESULTS_APPROVAL_ABS = `${MODULE_BASE_URL}${URL_LAB_RESULTS_APPROVAL}`;

export const URL_DEFAULT_LOG = `${BASE_OPENMRS_APP_URL}${restBaseUrl}/labmanagement/assets`;

export const URL_PATIENT_CHART_LAB = (patientUuid: string) =>
  `${BASE_OPENMRS_APP_SPA_URL}patient/${patientUuid}/chart/laboratory-orders`;

export const URL_API_BATCH_JOB = `${restBaseUrl}/labmanagement/batch-job`;
export const URL_API_BATCH_JOB_URL = (batchJobUuid: string) =>
  `${restBaseUrl}/labmanagement/batch-job/${batchJobUuid}`;

export const URL_API_LAB_REPORTS = `${restBaseUrl}/labmanagement/report`;
export const URL_API_LAB_REPORT_URL = (reportUuid: string) =>
  `${restBaseUrl}/labmanagement/report/${reportUuid}`;

export const URL_LAB_REPORTS = ROUTING_BASE_URL + "lab-reports";
export const URL_LAB_REPORTS_PATH = `${URL_LAB_REPORTS}/*`;
export const URL_LAB_REPORTS_ABS = `${MODULE_BASE_URL}${URL_LAB_REPORTS}`;
export const URL_LAB_REPORT = (uuid: string): string =>
  `${URL_LAB_REPORTS}/${uuid}`;
export const URL_BATCH_JOB_ARTIFACT = (
  uuid: string,
  download: boolean
): string =>
  `${BASE_OPENMRS_APP_URL}/ws/rest/v1/labmanagement/batch-job-artifact?id=${uuid}${
    download ? "&download=1" : ""
  }`;

export const URL_API_TEST_IMPORT_CONFIG = `${restBaseUrl}/labmanagement/test-result-import-config`;
export const URL_API_TEST_IMPORT_CONFIG_IMPORT = `${restBaseUrl}/labmanagement/test-result-import-config`;

export const URL_API_STORAGE = `${restBaseUrl}/labmanagement/storage`;
export const URL_API_STORAGE_UNIT = `${restBaseUrl}/labmanagement/storage-unit`;

export const URL_API_TEST_REST_ATTACHMENT_UPLOAD = `${restBaseUrl}/labmanagement/test-result-attachment`;
export const URL_API_TEST_REST_ATTACHMENT_DOWNLOAD = (testResultUuid: string) =>
  `${BASE_OPENMRS_APP_URL}${restBaseUrl}/labmanagement/test-result-attachment?id=${testResultUuid}`;
