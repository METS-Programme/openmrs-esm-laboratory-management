import { usePagination } from "@openmrs/esm-framework";
import { URL_API_SAMPLE_ACTIVITY } from "../config/urls";
import {
  ResourceFilterCriteria,
  ResourceRepresentation,
  toQueryParams,
} from "./resource-filter-criteria";
import { PageableResult } from "./types/pageable-result";
import useSWR from "swr";
import { SampleActivity } from "./types/sample-activity";
import { useCallback, useEffect, useState } from "react";
import useSWRMutation from "swr/mutation";
import { useTranslation } from "react-i18next";
import { customOpenMRSFetch } from "./custom-openmrs-fetch";

export interface SampleActivityFilter extends ResourceFilterCriteria {
  sample?: string;
}

export function getSampleActivity(filter: SampleActivityFilter) {
  const apiUrl = `${URL_API_SAMPLE_ACTIVITY}${toQueryParams(filter)}`;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });
}

export function useSampleActivity(filter: SampleActivityFilter) {
  const apiUrl = `${URL_API_SAMPLE_ACTIVITY}${toQueryParams(filter)}`;
  const { data, error, isLoading, isValidating } = useSWR<
    {
      data: PageableResult<SampleActivity>;
    },
    Error
  >(apiUrl, customOpenMRSFetch);

  return {
    items: data?.data || <PageableResult<SampleActivity>>{},
    isLoading,
    isError: error,
    isValidating,
  };
}

export function useLazySampleActivityResource(
  defaultFilters?: SampleActivityFilter
) {
  const [isLazy, setIsLazy] = useState(true);

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPage, setCurrentPage] = useState(
    (defaultFilters?.startIndex ?? 0) + 1
  );
  const [currentPageSize, setPageSize] = useState(defaultFilters?.limit ?? 10);
  const [searchString, setSearchString] = useState(defaultFilters?.q);
  const [loaded, setLoaded] = useState<boolean>(false);

  const [SampleActivityFilter, setSampleActivityFilter] =
    useState<SampleActivityFilter>(() => {
      return {
        ...{
          startIndex: currentPage - 1,
          v: ResourceRepresentation.Default,
          limit: 10,
          q: defaultFilters?.q,
          totalCount: defaultFilters?.totalCount ?? true,
          sort: "-id",
        },
        ...(defaultFilters ?? <SampleActivityFilter>{}),
      };
    });

  const getSampleActivity = useCallback((filterCriteria) => {
    setSampleActivityFilter(filterCriteria);
    setIsLazy(false);
  }, []);

  const fetcher = () => {
    let apiUrl = `${URL_API_SAMPLE_ACTIVITY}${toQueryParams(
      SampleActivityFilter
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
      data: PageableResult<SampleActivity>;
    },
    Error
  >(`${URL_API_SAMPLE_ACTIVITY}`, fetcher);

  const pagination = usePagination(items?.data?.results ?? [], currentPageSize);

  useEffect(() => {
    setSampleActivityFilter((e) => {
      return {
        ...e,
        ...{
          startIndex: currentPage - 1,
          limit: currentPageSize,
          q: searchString,
          totalCount: e.totalCount,
          v: e.v,
        },
      };
    });
  }, [searchString, currentPage, currentPageSize]);

  useEffect(() => {
    if (!loaded && isMutating) {
      setLoaded(true);
    }
  }, [isMutating, loaded]);

  useEffect(() => {
    if (!isLazy) {
      trigger();
    }
  }, [SampleActivityFilter, isLazy, trigger]);

  return {
    getSampleActivity,
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
    SampleActivityFilter,
    setSampleActivityFilter,
    isLazy,
  };
}

export function useSampleActivityResource(
  defaultFilters?: SampleActivityFilter
) {
  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPage, setCurrentPage] = useState(
    (defaultFilters?.startIndex ?? 0) + 1
  );
  const [currentPageSize, setPageSize] = useState(defaultFilters?.limit ?? 10);
  const [searchString, setSearchString] = useState(defaultFilters?.q);
  const [loaded, setLoaded] = useState<boolean>(false);

  const [SampleActivityFilter, setSampleActivityFilter] =
    useState<SampleActivityFilter>(() => {
      return {
        ...{
          startIndex: currentPage - 1,
          v: ResourceRepresentation.Default,
          limit: 10,
          q: defaultFilters?.q,
          totalCount: defaultFilters?.totalCount ?? true,
          sort: "-id",
        },
        ...(defaultFilters ?? <SampleActivityFilter>{}),
      };
    });

  const { items, isLoading, isError, isValidating } =
    useSampleActivity(SampleActivityFilter);
  const pagination = usePagination(items.results, currentPageSize);

  useEffect(() => {
    setSampleActivityFilter((e) => {
      return {
        ...e,
        ...{
          startIndex: currentPage - 1,
          limit: currentPageSize,
          q: searchString,
          totalCount: e.totalCount,
          v: e.v,
        },
      };
    });
  }, [searchString, currentPage, currentPageSize]);

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
    SampleActivityFilter,
    setSampleActivityFilter,
  };
}
