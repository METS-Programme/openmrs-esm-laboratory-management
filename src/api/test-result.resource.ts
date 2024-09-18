import { usePagination } from "@openmrs/esm-framework";
import {
  URL_API_TESTRESULT,
  URL_API_TESTRESULT_URL,
  URL_API_WORKSHEET_TESTRESULTS_URL,
} from "../config/urls";
import {
  ResourceFilterCriteria,
  ResourceRepresentation,
  toQueryParams,
} from "./resource-filter-criteria";
import { PageableResult } from "./types/pageable-result";
import useSWR from "swr";
import { TestResult } from "./types/test-result";
import { useCallback, useEffect, useState } from "react";
import useSWRMutation from "swr/mutation";
import { useTranslation } from "react-i18next";
import { customOpenMRSFetch } from "./custom-openmrs-fetch";
import { UrgencyType } from "./types/urgency";

export interface TestResultFilter extends ResourceFilterCriteria {
  testResult?: string;
  testRequestItem?: string;
  worksheetItem?: string;
  patient?: string;
  requireApproval?: boolean;
  completed?: boolean;
  completedResult?: boolean;
  approvalPerm?: boolean;
}

// createTestResult
export function getTestResult(uuid: string, filter: TestResultFilter) {
  const apiUrl = `${URL_API_TESTRESULT_URL(uuid)}${toQueryParams(filter)}`;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });
}

export function getTestResults(filter: TestResultFilter) {
  const apiUrl = `${URL_API_TESTRESULT}${toQueryParams(filter)}`;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });
}

export function createWorksheetTestResult(item: any) {
  const apiUrl = URL_API_WORKSHEET_TESTRESULTS_URL;
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

// createTestResult
export function createTestResult(item: any) {
  const apiUrl = URL_API_TESTRESULT;
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

// updateTestResult
export function updateTestResult(uuid: string, item: any) {
  const apiUrl = URL_API_TESTRESULT_URL(uuid);
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

export function useTestResults(filter: TestResultFilter) {
  const apiUrl = `${URL_API_TESTRESULT}${toQueryParams(filter)}`;
  const { data, error, isLoading, isValidating } = useSWR<
    {
      data: PageableResult<TestResult>;
    },
    Error
  >(apiUrl, customOpenMRSFetch);

  return {
    items: data?.data || <PageableResult<TestResult>>{},
    isLoading,
    isError: error,
    isValidating,
  };
}

export function useLazyTestResults() {
  const [isLazy, setIsLazy] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState<TestResultFilter>();

  const fetcher = () => {
    let apiUrl = `${URL_API_TESTRESULT}${toQueryParams(searchCriteria)}`;
    return customOpenMRSFetch(apiUrl);
  };

  const { data, error, trigger, isMutating } = useSWRMutation<
    {
      data: PageableResult<TestResult>;
    },
    Error
  >(`${URL_API_TESTRESULT}`, fetcher);

  const getTestResults = useCallback((filterCriteria) => {
    setSearchCriteria(filterCriteria);
    setIsLazy(false);
  }, []);

  useEffect(() => {
    if (!isLazy) {
      trigger();
    }
  }, [searchCriteria, isLazy, trigger]);

  return {
    getTestResults,
    items: data?.data || <PageableResult<TestResult>>{},
    isLoading: false,
    isError: error,
    isValidating: isLazy ? false : isMutating,
  };
}

export function useTestResultResource(defaultFilters?: TestResultFilter) {
  const { t } = useTranslation();

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setPageSize] = useState(10);
  const [searchString, setSearchString] = useState(null);
  const [itemLocation, setItemLocation] = useState(null);
  const [testConcept, setTestConcept] = useState(null);
  const [minActivatedDate, setMinActivatedDate] = useState(null);
  const [maxActivatedDate, setMaxActivatedDate] = useState(null);

  const [loaded, setLoaded] = useState<boolean>(false);

  const [testRequestFilter, setTestResultFilter] = useState<TestResultFilter>(
    () => {
      return {
        ...{
          startIndex: currentPage - 1,
          v: ResourceRepresentation.Default,
          limit: 10,
          q: null,
          totalCount: true,
          sort: "-id",
        },
        ...(defaultFilters ?? <TestResultFilter>{}),
      };
    }
  );

  const { items, isLoading, isError, isValidating } =
    useTestResults(testRequestFilter);
  const pagination = usePagination(items.results, currentPageSize);

  useEffect(() => {
    setTestResultFilter((e) => {
      return {
        ...e,
        ...{
          startIndex: currentPage - 1,
          limit: currentPageSize,
          q: searchString,
          totalCount: e.totalCount,
          v: e.v,
          minActivatedDate: minActivatedDate,
          maxActivatedDate: maxActivatedDate,
          itemLocation: itemLocation,
          testConcept: testConcept,
        },
      };
    });
  }, [
    searchString,
    currentPage,
    currentPageSize,
    minActivatedDate,
    maxActivatedDate,
    itemLocation,
    testConcept,
  ]);

  useEffect(() => {
    if (!loaded && isLoading) {
      setLoaded(true);
    }
  }, [isLoading, loaded]);

  return {
    items: pagination.results,
    pagination,
    totalCount: items.totalCount,
    currentPageSize,
    currentPage,
    setCurrentPage,
    setPageSize,
    pageSizes,
    isLoading,
    isValidating,
    isError,
    setSearchString,
    loaded,
    minActivatedDate,
    maxActivatedDate,
    setMinActivatedDate,
    setMaxActivatedDate,
    itemLocation,
    setItemLocation,
    testConcept,
    setTestConcept,
  };
}
