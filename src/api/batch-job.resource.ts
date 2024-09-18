import {
  ResourceFilterCriteria,
  ResourceRepresentation,
  toQueryParams,
} from "./resource-filter-criteria";
import useSWRMutation from "swr/mutation";
import { PageableResult } from "./types/pageable-result";
import { BatchJob, BatchJobType } from "./types/batch-job";
import { useCallback, useEffect, useState } from "react";
import {
  URL_API_BATCH_JOB,
  URL_API_BATCH_JOB_URL,
  URL_API_LAB_REPORTS,
} from "../config/urls";
import useSWR from "swr";
import { customOpenMRSFetch } from "./custom-openmrs-fetch";
import { ReportType } from "./types/report-type";
import { usePagination } from "@openmrs/esm-framework";

export interface BatchJobFilter extends ResourceFilterCriteria {
  batchJobType?: string | null | undefined;
  status?: string | null;
  locationScopeUuid?: string | null;
  dateCreatedMin?: string | null | undefined;
  dateCreatedMax?: string | null | undefined;
  completedDateMin?: string | null | undefined;
  completedDateMax?: string | null | undefined;
}

export function useBatchJobs(filter: BatchJobFilter, refreshInterval?: number) {
  const apiUrl = `${URL_API_BATCH_JOB}${toQueryParams(filter)}`;
  const { data, error, isLoading, isValidating } = useSWR<
    {
      data: PageableResult<BatchJob>;
    },
    Error
  >(apiUrl, customOpenMRSFetch, { refreshInterval: refreshInterval ?? 0 });

  return {
    items: data?.data || <PageableResult<BatchJob>>{},
    isLoading,
    isError: error,
    isValidating,
  };
}

export function useLazyBatchJobResource(filter: BatchJobFilter) {
  const [isLazy, setIsLazy] = useState(true);
  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPage, setCurrentPage] = useState((filter?.startIndex ?? 0) + 1);
  const [currentPageSize, setPageSize] = useState(filter?.limit ?? 10);
  const [searchString, setSearchString] = useState(filter?.q);
  const [searchCriteria, setSearchCriteria] = useState<BatchJobFilter>(() => {
    return {
      ...{
        startIndex: currentPage - 1,
        v: ResourceRepresentation.Default,
        limit: 10,
        q: filter?.q,
        totalCount: filter?.totalCount ?? true,
        sort: "-id",
      },
      ...(filter ?? <BatchJobFilter>{}),
    };
  });
  const [batchJobType, setBatchJobType] = useState<string>(filter.batchJobType);
  const [status, setStatus] = useState<string>(filter.status);
  const [locationScopeUuid, setLocationScopeUuid] = useState<string>(
    filter.locationScopeUuid
  );
  const [dateCreatedMin, setDateCreatedMin] = useState<string>(
    filter.dateCreatedMin
  );
  const [dateCreatedMax, setDateCreatedMax] = useState<string>(
    filter.dateCreatedMax
  );
  const [completedDateMin, setCompletedDateMin] = useState<string>(
    filter.completedDateMin
  );
  const [completedDateMax, setCompletedDateMax] = useState<string>(
    filter.completedDateMax
  );

  const [loaded, setLoaded] = useState<boolean>(false);
  const fetcher = () => {
    let apiUrl = `${URL_API_BATCH_JOB}${toQueryParams(searchCriteria)}`;
    return customOpenMRSFetch(apiUrl);
  };

  const {
    data: items,
    error,
    trigger,
    isMutating,
  } = useSWRMutation<
    {
      data: PageableResult<BatchJob>;
    },
    Error
  >(`${URL_API_BATCH_JOB}`, fetcher);

  const getBatchJobs = useCallback((filterCriteria) => {
    setSearchCriteria(filterCriteria);
    setIsLazy(false);
  }, []);

  useEffect(() => {
    if (!loaded && isMutating) {
      setLoaded(true);
    }
  }, [isMutating, loaded]);

  useEffect(() => {
    if (!isLazy) {
      trigger();
    }
  }, [searchCriteria, isLazy, trigger]);

  const pagination = usePagination(items?.data?.results ?? [], currentPageSize);

  useEffect(() => {
    setSearchCriteria((e) => {
      return {
        ...e,
        ...{
          startIndex: currentPage - 1,
          limit: currentPageSize,
          q: searchString,
          totalCount: e.totalCount,
          v: e.v,
          batchJobType,
          status,
          locationScopeUuid,
          dateCreatedMin,
          dateCreatedMax,
          completedDateMin,
          completedDateMax,
        },
      };
    });
  }, [
    searchString,
    currentPage,
    currentPageSize,
    batchJobType,
    status,
    locationScopeUuid,
    dateCreatedMin,
    dateCreatedMax,
    completedDateMin,
    completedDateMax,
  ]);

  return {
    getBatchJobs,
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
    batchJobType,
    setBatchJobType,
    status,
    setStatus,
    locationScopeUuid,
    setLocationScopeUuid,
    dateCreatedMin,
    setDateCreatedMin,
    dateCreatedMax,
    setDateCreatedMax,
    completedDateMin,
    setCompletedDateMin,
    completedDateMax,
    setCompletedDateMax,
  };
}

export function useBatchJobResource(
  filter: BatchJobFilter,
  refreshInterval?: number
) {
  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPage, setCurrentPage] = useState((filter?.startIndex ?? 0) + 1);
  const [currentPageSize, setPageSize] = useState(filter?.limit ?? 10);
  const [searchString, setSearchString] = useState(filter?.q);
  const [searchCriteria, setSearchCriteria] = useState<BatchJobFilter>(() => {
    return {
      ...{
        startIndex: currentPage - 1,
        v: ResourceRepresentation.Default,
        limit: 10,
        q: filter?.q,
        totalCount: filter?.totalCount ?? true,
        sort: "-id",
      },
      ...(filter ?? <BatchJobFilter>{}),
    };
  });
  const [batchJobType, setBatchJobType] = useState<string>(filter.batchJobType);
  const [status, setStatus] = useState<string>(filter.status);
  const [locationScopeUuid, setLocationScopeUuid] = useState<string>(
    filter.locationScopeUuid
  );
  const [dateCreatedMin, setDateCreatedMin] = useState<string>(
    filter.dateCreatedMin
  );
  const [dateCreatedMax, setDateCreatedMax] = useState<string>(
    filter.dateCreatedMax
  );
  const [completedDateMin, setCompletedDateMin] = useState<string>(
    filter.completedDateMin
  );
  const [completedDateMax, setCompletedDateMax] = useState<string>(
    filter.completedDateMax
  );

  const [loaded, setLoaded] = useState<boolean>(false);

  const { items, isLoading, isError, isValidating } = useBatchJobs(
    searchCriteria,
    refreshInterval
  );
  const pagination = usePagination(items.results, currentPageSize);

  useEffect(() => {
    setSearchCriteria((e) => {
      return {
        ...e,
        ...{
          startIndex: currentPage - 1,
          limit: currentPageSize,
          q: searchString,
          totalCount: e.totalCount,
          v: e.v,
          batchJobType,
          status,
          locationScopeUuid,
          dateCreatedMin,
          dateCreatedMax,
          completedDateMin,
          completedDateMax,
        },
      };
    });
  }, [
    searchString,
    currentPage,
    currentPageSize,
    batchJobType,
    status,
    locationScopeUuid,
    dateCreatedMin,
    dateCreatedMax,
    completedDateMin,
    completedDateMax,
  ]);

  useEffect(() => {
    if (!loaded && isLoading) {
      setLoaded(true);
    }
  }, [isLoading, loaded]);

  return {
    items: pagination.results,
    pagination,
    totalCount: items?.totalCount ?? 0,
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
    batchJobType,
    setBatchJobType,
    status,
    setStatus,
    locationScopeUuid,
    setLocationScopeUuid,
    dateCreatedMin,
    setDateCreatedMin,
    dateCreatedMax,
    setDateCreatedMax,
    completedDateMin,
    setCompletedDateMin,
    completedDateMax,
    setCompletedDateMax,
  };
}

// cancelBatchJobs
export function cancelBatchJobs(ids: string[], reason: string) {
  let otherIds = ids.reduce((p, c, i) => {
    if (i === 0) return p;
    p += (p.length > 0 ? "," : "") + encodeURIComponent(c);
    return p;
  }, "");
  if (otherIds.length > 0) {
    otherIds = `?ids=${otherIds}&reason=${encodeURIComponent(reason)}`;
  } else {
    otherIds = `?reason=${encodeURIComponent(reason)}`;
  }
  const apiUrl = URL_API_BATCH_JOB_URL(`${ids[0]}${otherIds}`);
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: {
      reason: reason,
    },
  });
}

// createBatchJob
export function createBatchJob(item: any) {
  const apiUrl = URL_API_BATCH_JOB;
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

export function useReportTypes() {
  const apiUrl = `${URL_API_LAB_REPORTS}?v=default`;
  const { data, error, isLoading } = useSWR<
    { data: PageableResult<ReportType> },
    Error
  >(apiUrl, customOpenMRSFetch);
  return {
    items: data?.data?.results ?? [],
    isLoading,
    isError: error,
  };
}
