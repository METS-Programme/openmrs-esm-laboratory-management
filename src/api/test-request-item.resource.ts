import { usePagination } from "@openmrs/esm-framework";
import { URL_API_TEST_REQUEST_ITEMS } from "../config/urls";
import {
  ResourceFilterCriteria,
  ResourceRepresentation,
  toQueryParams,
} from "./resource-filter-criteria";
import { PageableResult } from "./types/pageable-result";
import useSWR from "swr";
import { TestRequestItem } from "./types/test-request-item";
import { useCallback, useEffect, useState } from "react";
import useSWRMutation from "swr/mutation";
import { useTranslation } from "react-i18next";
import { customOpenMRSFetch } from "./custom-openmrs-fetch";

export interface TestRequestItemFilter extends ResourceFilterCriteria {
  itemLocation?: string;
  testRequest?: string;
  itemStatus?: string;
  testConcept?: string;
  referredOut?: boolean;
  patient?: string;
  includeTestSamples?: boolean;
  worksheetInfo?: boolean;
  approvals?: boolean;
  approvalsOnly?: boolean;
  approvalPerm?: boolean;
  includeTestResult?: boolean;
  testResultApprovals?: boolean;
  itemMatch?: string;
  sample?: string;
}

export function getTestRequestItems(filter: TestRequestItemFilter) {
  const apiUrl = `${URL_API_TEST_REQUEST_ITEMS}${toQueryParams(filter)}`;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });
}

export function useTestRequestItems(filter: TestRequestItemFilter) {
  const apiUrl = `${URL_API_TEST_REQUEST_ITEMS}${toQueryParams(filter)}`;
  const { data, error, isLoading, isValidating } = useSWR<
    {
      data: PageableResult<TestRequestItem>;
    },
    Error
  >(apiUrl, customOpenMRSFetch);

  return {
    items: data?.data || <PageableResult<TestRequestItem>>{},
    isLoading,
    isError: error,
    isValidating,
  };
}

export function useLazyTestRequestItemResource(
  defaultFilters?: TestRequestItemFilter
) {
  const [isLazy, setIsLazy] = useState(true);

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPage, setCurrentPage] = useState(
    (defaultFilters?.startIndex ?? 0) + 1
  );
  const [currentPageSize, setPageSize] = useState(defaultFilters?.limit ?? 10);
  const [searchString, setSearchString] = useState(defaultFilters?.q);
  const [itemLocation, setItemLocation] = useState(
    defaultFilters?.itemLocation
  );
  const [testConcept, setTestConcept] = useState(defaultFilters?.testConcept);

  const [loaded, setLoaded] = useState<boolean>(false);
  const [testItemStatuses, setTestItemStatuses] = useState<string>(
    defaultFilters?.itemStatus
  );

  const [testResultApprovals, setTestResultApprovals] = useState<boolean>(
    defaultFilters?.testResultApprovals
  );

  const [worksheetInfo, setWorksheetInfo] = useState<boolean>(
    defaultFilters?.worksheetInfo
  );
  const [itemMatch, setItemMatch] = useState<string>(defaultFilters?.itemMatch);

  const [TestRequestItemFilter, setTestRequestItemFilter] =
    useState<TestRequestItemFilter>(() => {
      return {
        ...{
          startIndex: currentPage - 1,
          v: ResourceRepresentation.Default,
          limit: 10,
          q: defaultFilters?.q,
          totalCount: defaultFilters?.totalCount ?? true,
          sort: "-id",
        },
        ...(defaultFilters ?? <TestRequestItemFilter>{}),
      };
    });

  const getTestRequestItems = useCallback((filterCriteria) => {
    setTestRequestItemFilter(filterCriteria);
    setIsLazy(false);
  }, []);

  const fetcher = () => {
    let apiUrl = `${URL_API_TEST_REQUEST_ITEMS}${toQueryParams(
      TestRequestItemFilter
    )}`;
    return customOpenMRSFetch(apiUrl);
  };

  const {
    data: items,
    error,
    trigger,
    isMutating,
  } = useSWRMutation<
    {
      data: PageableResult<TestRequestItem>;
    },
    Error
  >(`${URL_API_TEST_REQUEST_ITEMS}`, fetcher);

  const pagination = usePagination(items?.data?.results ?? [], currentPageSize);

  useEffect(() => {
    setTestRequestItemFilter((e) => {
      return {
        ...e,
        ...{
          startIndex: currentPage - 1,
          limit: currentPageSize,
          q: searchString,
          totalCount: e.totalCount,
          v: e.v,
          itemLocation: itemLocation,
          testConcept: testConcept,
          itemStatus: testItemStatuses,

          testResultApprovals: testResultApprovals,

          worksheetInfo: worksheetInfo,
          itemMatch: itemMatch,
        },
      };
    });
  }, [
    searchString,
    currentPage,
    currentPageSize,
    itemLocation,
    testConcept,
    testItemStatuses,
    testResultApprovals,
    worksheetInfo,
    itemMatch,
  ]);

  useEffect(() => {
    if (!loaded && isMutating) {
      setLoaded(true);
    }
  }, [isMutating, loaded]);

  useEffect(() => {
    if (!isLazy) {
      trigger();
    }
  }, [TestRequestItemFilter, isLazy, trigger]);

  return {
    getTestRequestItems,
    items: pagination.results,
    pagination,
    totalCount: items?.data?.totalCount ?? 0,
    currentPageSize,
    currentPage,
    setCurrentPage,
    setPageSize,
    pageSizes,
    isLoading: false,
    isValidating: isLazy ? false : isMutating,
    isError: error,
    setSearchString,
    loaded,
    itemLocation,
    setItemLocation,
    testConcept,
    setTestConcept,
    testItemStatuses,
    setTestItemStatuses,
    TestRequestItemFilter,
    setTestRequestItemFilter,
    testResultApprovals,
    setTestResultApprovals,
    worksheetInfo,
    setWorksheetInfo,
    isLazy,
    setItemMatch,
    itemMatch,
  };
}

export function useTestRequestItemResource(
  defaultFilters?: TestRequestItemFilter
) {
  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPage, setCurrentPage] = useState(
    (defaultFilters?.startIndex ?? 0) + 1
  );
  const [currentPageSize, setPageSize] = useState(defaultFilters?.limit ?? 10);
  const [searchString, setSearchString] = useState(defaultFilters?.q);
  const [itemLocation, setItemLocation] = useState(
    defaultFilters?.itemLocation
  );
  const [testConcept, setTestConcept] = useState(defaultFilters?.testConcept);

  const [loaded, setLoaded] = useState<boolean>(false);
  const [testItemStatuses, setTestItemStatuses] = useState<string>(
    defaultFilters?.itemStatus
  );

  const [testResultApprovals, setTestResultApprovals] = useState<boolean>(
    defaultFilters?.testResultApprovals
  );

  const [worksheetInfo, setWorksheetInfo] = useState<boolean>(
    defaultFilters?.worksheetInfo
  );

  const [itemMatch, setItemMatch] = useState<string>(defaultFilters?.itemMatch);

  const [TestRequestItemFilter, setTestRequestItemFilter] =
    useState<TestRequestItemFilter>(() => {
      return {
        ...{
          startIndex: currentPage - 1,
          v: ResourceRepresentation.Default,
          limit: 10,
          q: defaultFilters?.q,
          totalCount: defaultFilters?.totalCount ?? true,
          sort: "-id",
        },
        ...(defaultFilters ?? <TestRequestItemFilter>{}),
      };
    });

  const { items, isLoading, isError, isValidating } = useTestRequestItems(
    TestRequestItemFilter
  );
  const pagination = usePagination(items.results, currentPageSize);

  useEffect(() => {
    setTestRequestItemFilter((e) => {
      return {
        ...e,
        ...{
          startIndex: currentPage - 1,
          limit: currentPageSize,
          q: searchString,
          totalCount: e.totalCount,
          v: e.v,
          itemLocation: itemLocation,
          testConcept: testConcept,
          itemStatus: testItemStatuses,
          testResultApprovals: testResultApprovals,
          worksheetInfo: worksheetInfo,
          itemMatch: itemMatch,
        },
      };
    });
  }, [
    searchString,
    currentPage,
    currentPageSize,
    itemLocation,
    testConcept,
    testItemStatuses,
    testResultApprovals,
    worksheetInfo,
    itemMatch,
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
    itemLocation,
    setItemLocation,
    testConcept,
    setTestConcept,
    testItemStatuses,
    setTestItemStatuses,
    TestRequestItemFilter,
    setTestRequestItemFilter,
    testResultApprovals,
    setTestResultApprovals,
    worksheetInfo,
    setWorksheetInfo,
    itemMatch,
    setItemMatch,
  };
}
