import {
  ResourceFilterCriteria,
  toQueryParams,
} from "./resource-filter-criteria";
import useSWR from "swr";
import { PageableResult } from "./types/pageable-result";
import { TestConfig } from "./types/test-config";
import {
  URL_API_TEST_CONFIG,
  URL_API_TEST_CONFIG_IMPORT,
  URL_API_TEST_REST_ATTACHMENT_UPLOAD,
  URL_TEST_CONFIG_IMPORT,
} from "../config/urls";
import { customOpenMRSFetch } from "./custom-openmrs-fetch";

export interface TestConfigFilter extends ResourceFilterCriteria {
  active?: boolean | null;
  testGroup?: string | null;
}

export function useTestConfigs(filter: TestConfigFilter) {
  const apiUrl = `${URL_API_TEST_CONFIG}${toQueryParams(filter)}`;
  const { data, error, isLoading, isValidating } = useSWR<
    {
      data: PageableResult<TestConfig>;
    },
    Error
  >(apiUrl, customOpenMRSFetch, { revalidateOnFocus: false });

  return {
    items: data?.data || <PageableResult<TestConfig>>{},
    isLoading,
    isError: error,
    isValidating,
  };
}

// createTestConfig
export function createTestConfig(item: TestConfig) {
  const apiUrl = URL_API_TEST_CONFIG;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: {
      requireApproval: item.requireApproval,
      enabled: item.enabled,
      testUuid: item.testUuid,
      testGroupUuid: item.testGroupUuid,
      approvalFlowUuid: item.approvalFlowUuid,
    },
  });
}

// updateTestConfig
export function updateTestConfig(item: TestConfig) {
  const apiUrl = `${URL_API_TEST_CONFIG}/${item.uuid}`;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: {
      requireApproval: item.requireApproval,
      enabled: item.enabled,
      testGroupUuid: item.testGroupUuid,
      approvalFlowUuid: item.approvalFlowUuid,
    },
  });
}

export async function uploadTestConfigurations(body: any) {
  const abortController = new AbortController();
  return customOpenMRSFetch(URL_TEST_CONFIG_IMPORT, {
    method: "POST",
    signal: abortController.signal,
    body: body,
  });
}

export async function attachTestResult(body: any) {
  const abortController = new AbortController();
  return customOpenMRSFetch(URL_API_TEST_REST_ATTACHMENT_UPLOAD, {
    method: "POST",
    signal: abortController.signal,
    body: body,
  });
}
