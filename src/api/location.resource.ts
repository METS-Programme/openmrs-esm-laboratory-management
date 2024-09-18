import { usePagination } from "@openmrs/esm-framework";
import {
  URL_API_LAB_LOCATION,
  URL_API_LOCATION,
  URL_API_LOCATION_TAG,
  URL_API_LOCATION_URL,
} from "../config/urls";
import {
  ResourceFilterCriteria,
  ResourceRepresentation,
  toQueryParams,
} from "./resource-filter-criteria";
import { PageableResult } from "./types/pageable-result";
import useSWR from "swr";
import { useCallback, useEffect, useState } from "react";
import useSWRMutation from "swr/mutation";
import { useTranslation } from "react-i18next";
import { customOpenMRSFetch } from "./custom-openmrs-fetch";
import { OpenMRSLocation, OpenMRSLocationTag } from "./types/location";
import { handleMutate } from "./swr-revalidation";

export interface OpenMRSLocationFilter extends ResourceFilterCriteria {
  tag?: string;
}

export function getLabLocation(uuid: string, filter: OpenMRSLocationFilter) {
  const apiUrl = `${URL_API_LAB_LOCATION(uuid)}${toQueryParams(filter)}`;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });
}

export function deleteLabLocation(uuid: string, remarks: string) {
  const apiUrl = URL_API_LAB_LOCATION(uuid);
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: {
      reason: remarks,
    },
  });
}

// createOpenMRSLocation
export function getOpenMRSLocation(
  uuid: string,
  filter: OpenMRSLocationFilter
) {
  const apiUrl = `${URL_API_LOCATION_URL(uuid)}${toQueryParams(filter)}`;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });
}

export function getOpenMRSLocations(filter: OpenMRSLocationFilter) {
  const apiUrl = `${URL_API_LOCATION}${toQueryParams(filter)}`;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });
}

export function useOpenMRSLocations(filter: OpenMRSLocationFilter) {
  const apiUrl = `${URL_API_LOCATION}${toQueryParams(filter, false)}`;
  const { data, error, isLoading, isValidating } = useSWR<
    {
      data: PageableResult<OpenMRSLocation>;
    },
    Error
  >(apiUrl, customOpenMRSFetch);

  return {
    items: data?.data || <PageableResult<OpenMRSLocation>>{},
    isLoading,
    isError: error,
    isValidating,
  };
}

export function useLazyOpenMRSLocations() {
  const [isLazy, setIsLazy] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState<OpenMRSLocationFilter>();

  const fetcher = () => {
    let apiUrl = `${URL_API_LOCATION}${toQueryParams(searchCriteria, false)}`;
    return customOpenMRSFetch(apiUrl);
  };

  const { data, error, trigger, isMutating } = useSWRMutation<
    {
      data: PageableResult<OpenMRSLocation>;
    },
    Error
  >(`${URL_API_LOCATION}`, fetcher);

  const getOpenMRSLocations = useCallback((filterCriteria) => {
    setSearchCriteria(filterCriteria);
    setIsLazy(false);
  }, []);

  useEffect(() => {
    if (!isLazy) {
      trigger();
    }
  }, [searchCriteria, isLazy, trigger]);

  return {
    getOpenMRSLocations,
    items: data?.data || <PageableResult<OpenMRSLocation>>{},
    isLoading: false,
    isError: error,
    isValidating: isLazy ? false : isMutating,
  };
}

export function useOpenMRSLocationResource(
  defaultFilters?: OpenMRSLocationFilter
) {
  const { t } = useTranslation();

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPage, setCurrentPage] = useState(
    (defaultFilters?.startIndex ?? 0) + 1
  );
  const [currentPageSize, setPageSize] = useState(defaultFilters.limit ?? 10);
  const [searchString, setSearchString] = useState(defaultFilters?.q ?? "");
  const [locationTag, setLocationTag] = useState(defaultFilters.tag);
  const [loaded, setLoaded] = useState<boolean>(false);

  const [locationFilter, setOpenMRSLocationFilter] =
    useState<OpenMRSLocationFilter>({
      ...{
        startIndex: currentPage - 1,
        v: ResourceRepresentation.Default,
        limit: 10,
        q: "",
        totalCount: true,
      },
      ...(defaultFilters ?? <OpenMRSLocationFilter>{}),
    });

  const { items, isLoading, isError, isValidating } =
    useOpenMRSLocations(locationFilter);
  const pagination = usePagination(items.results, currentPageSize);

  useEffect(() => {
    setOpenMRSLocationFilter((e) => {
      return {
        ...e,
        ...{
          startIndex: currentPage - 1,
          limit: currentPageSize,
          q: searchString,
          totalCount: e.totalCount,
          v: e.v,
          tag: locationTag ? locationTag : null,
        },
      };
    });
  }, [searchString, currentPage, currentPageSize, locationTag]);

  useEffect(() => {
    if (!loaded && isLoading) {
      setLoaded(true);
    }
  }, [isLoading, loaded]);

  const refresh = useCallback(() => {
    handleMutate(URL_API_LOCATION);
  }, []);

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
    refresh,
    locationTag,
    setLocationTag,
  };
}

export function useOpenMRSLocationTags(filter: OpenMRSLocationFilter) {
  const apiUrl = `${URL_API_LOCATION_TAG}${toQueryParams(filter, false)}`;
  const { data, error, isLoading, isValidating } = useSWR<
    {
      data: PageableResult<OpenMRSLocationTag>;
    },
    Error
  >(apiUrl, customOpenMRSFetch, { revalidateOnFocus: false });

  return {
    items: data?.data || <PageableResult<OpenMRSLocationTag>>{},
    isLoading,
    isError: error,
    isValidating,
  };
}
