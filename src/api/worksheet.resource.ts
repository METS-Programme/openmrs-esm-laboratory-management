import { usePagination } from "@openmrs/esm-framework";
import { URL_API_WORKSHEET, URL_API_WORKSHEET_URL } from "../config/urls";
import {
  ResourceFilterCriteria,
  ResourceRepresentation,
  toQueryParams,
} from "./resource-filter-criteria";
import { PageableResult } from "./types/pageable-result";
import useSWR from "swr";
import { Worksheet } from "./types/worksheet";
import { useCallback, useEffect, useState } from "react";
import useSWRMutation from "swr/mutation";
import { useTranslation } from "react-i18next";
import { customOpenMRSFetch } from "./custom-openmrs-fetch";
import { UrgencyType } from "./types/urgency";

export interface WorksheetFilter extends ResourceFilterCriteria {
  worksheet?: string;
  itemLocation?: string;
  testConcept?: string;
  testConceptTests?: boolean;
  status?: string;
  itemStatus?: string;
  minActivatedDate?: Date | string;
  maxActivatedDate?: Date;
  sampleRef?: string;
  urgency?: UrgencyType;
  patient?: string;
  responsiblePersonUserId?: string;
  allItems?: boolean;
  includeWorksheetItemConcept?: boolean;
  includeWorksheetItemTestResult?: boolean;
  includeTestResultIds?: boolean;
  testResultApprovals?: boolean;
}

// createWorksheet
export function getWorksheet(uuid: string, filter: WorksheetFilter) {
  const apiUrl = `${URL_API_WORKSHEET_URL(uuid)}${toQueryParams(filter)}`;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });
}

export function getWorksheets(filter: WorksheetFilter) {
  const apiUrl = `${URL_API_WORKSHEET}${toQueryParams(filter)}`;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });
}

// createWorksheet
export function createWorksheet(item: any) {
  const apiUrl = URL_API_WORKSHEET;
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

// updateWorksheet
export function updateWorksheet(uuid: string, item: any) {
  const apiUrl = URL_API_WORKSHEET_URL(uuid);
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

export function useWorksheets(filter: WorksheetFilter) {
  const apiUrl = `${URL_API_WORKSHEET}${toQueryParams(filter)}`;
  const { data, error, isLoading, isValidating } = useSWR<
    {
      data: PageableResult<Worksheet>;
    },
    Error
  >(apiUrl, customOpenMRSFetch);

  return {
    items: data?.data || <PageableResult<Worksheet>>{},
    isLoading,
    isError: error,
    isValidating,
  };
}

export function useLazyWorksheets() {
  const [isLazy, setIsLazy] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState<WorksheetFilter>();

  const fetcher = () => {
    let apiUrl = `${URL_API_WORKSHEET}${toQueryParams(searchCriteria)}`;
    return customOpenMRSFetch(apiUrl);
  };

  const { data, error, trigger, isMutating } = useSWRMutation<
    {
      data: PageableResult<Worksheet>;
    },
    Error
  >(`${URL_API_WORKSHEET}`, fetcher);

  const getWorksheets = useCallback((filterCriteria) => {
    setSearchCriteria(filterCriteria);
    setIsLazy(false);
  }, []);

  useEffect(() => {
    if (!isLazy) {
      trigger();
    }
  }, [searchCriteria, isLazy, trigger]);

  return {
    getWorksheets,
    items: data?.data || <PageableResult<Worksheet>>{},
    isLoading: false,
    isError: error,
    isValidating: isLazy ? false : isMutating,
  };
}

export function useWorksheetResource(defaultFilters?: WorksheetFilter) {
  const { t } = useTranslation();

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setPageSize] = useState(10);
  const [searchString, setSearchString] = useState(null);
  const [itemLocation, setItemLocation] = useState(null);
  const [testConcept, setTestConcept] = useState(null);
  const [status, setStatus] = useState(defaultFilters?.status);
  const [minActivatedDate, setMinActivatedDate] = useState(
    defaultFilters?.minActivatedDate
  );
  const [maxActivatedDate, setMaxActivatedDate] = useState(
    defaultFilters?.maxActivatedDate
  );
  const [allItems, setAllItems] = useState<boolean>(
    defaultFilters?.allItems ?? true
  );
  const [loaded, setLoaded] = useState<boolean>(false);

  const [testRequestFilter, setWorksheetFilter] = useState<WorksheetFilter>(
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
        ...(defaultFilters ?? <WorksheetFilter>{}),
      };
    }
  );

  const { items, isLoading, isError, isValidating } =
    useWorksheets(testRequestFilter);
  const pagination = usePagination(items.results, currentPageSize);

  useEffect(() => {
    setWorksheetFilter((e) => {
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
          allItems: allItems,
          status: status,
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
    allItems,
    status,
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
    allItems,
    setAllItems,
    status,
    setStatus,
  };
}
