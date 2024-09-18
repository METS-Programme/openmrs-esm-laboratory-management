import {
  ResourceFilterCriteria,
  toQueryParams,
} from "./resource-filter-criteria";
import useSWR from "swr";
import { PageableResult } from "./types/pageable-result";
import { TestResultImportConfig } from "./types/test-result-import-config";
import {
  URL_API_TEST_IMPORT_CONFIG,
  URL_API_TEST_IMPORT_CONFIG_IMPORT,
} from "../config/urls";
import { customOpenMRSFetch } from "./custom-openmrs-fetch";

export interface TestImportConfigFilter extends ResourceFilterCriteria {}

export function useTestImportConfigs(filter: TestImportConfigFilter) {
  const apiUrl = `${URL_API_TEST_IMPORT_CONFIG}${toQueryParams(filter)}`;
  const { data, error, isLoading, isValidating } = useSWR<
    {
      data: PageableResult<TestResultImportConfig>;
    },
    Error
  >(apiUrl, customOpenMRSFetch, { revalidateOnFocus: false });

  return {
    items: data?.data || <PageableResult<TestResultImportConfig>>{},
    isLoading,
    isError: error,
    isValidating,
  };
}

// createTestImportConfig
export function createTestImportConfig(item: any) {
  const apiUrl = URL_API_TEST_IMPORT_CONFIG;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: item,
  });
}

export async function uploadTestImportConfigurations(body: any) {
  const abortController = new AbortController();
  return customOpenMRSFetch(URL_API_TEST_IMPORT_CONFIG_IMPORT, {
    method: "POST",
    signal: abortController.signal,
    body: body,
  });
}
