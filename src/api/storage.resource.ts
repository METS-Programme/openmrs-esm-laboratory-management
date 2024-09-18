import {
  ResourceFilterCriteria,
  toQueryParams,
} from "./resource-filter-criteria";
import useSWRMutation from "swr/mutation";
import { PageableResult } from "./types/pageable-result";
import { Storage, StorageUnit } from "./types/storage";
import { useCallback, useEffect, useState } from "react";
import { URL_API_STORAGE, URL_API_STORAGE_UNIT } from "../config/urls";
import useSWR from "swr";
import { customOpenMRSFetch } from "./custom-openmrs-fetch";

export interface StorageFilter extends ResourceFilterCriteria {
  storage?: string;
  storageUnit?: string;
  units?: boolean;
  active?: boolean;
  assigned?: boolean;
}

export function useStorages(filter: StorageFilter) {
  const apiUrl = `${URL_API_STORAGE}${toQueryParams(filter)}`;
  const { data, error, isLoading, isValidating } = useSWR<
    {
      data: PageableResult<Storage>;
    },
    Error
  >(apiUrl, customOpenMRSFetch, { revalidateOnFocus: false });

  return {
    items: data?.data || <PageableResult<Storage>>{},
    isLoading,
    isError: error,
    isValidating,
  };
}

export function useStorageUnits(filter: StorageFilter) {
  const apiUrl = `${URL_API_STORAGE_UNIT}${toQueryParams(filter)}`;
  const { data, error, isLoading, isValidating } = useSWR<
    {
      data: PageableResult<StorageUnit>;
    },
    Error
  >(apiUrl, customOpenMRSFetch, { revalidateOnFocus: false });

  return {
    items: data?.data || <PageableResult<StorageUnit>>{},
    isLoading,
    isError: error,
    isValidating,
  };
}

export function useLazyStorages(defaultFilter: StorageFilter) {
  const [isLazy, setIsLazy] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState<StorageFilter>(
    () => defaultFilter
  );

  const [loaded, setLoaded] = useState<boolean>(false);

  const fetcher = () => {
    let apiUrl = `${URL_API_STORAGE}${toQueryParams(searchCriteria)}`;
    return customOpenMRSFetch(apiUrl);
  };

  const { data, error, trigger, isMutating } = useSWRMutation<
    {
      data: PageableResult<Storage>;
    },
    Error
  >(`${URL_API_STORAGE}`, fetcher);

  const getStorages = useCallback(
    (filterCriteria) => {
      setSearchCriteria({
        ...(searchCriteria ?? {}),
        ...(filterCriteria ?? {}),
      });
      setIsLazy(false);
    },
    [searchCriteria]
  );

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

  return {
    getStorages,
    items: data?.data || <PageableResult<Storage>>{},
    isLoading: false,
    isError: error,
    isValidating: isLazy ? false : isMutating,
    loaded,
  };
}

// createStorage
export function createStorage(item: Storage) {
  const apiUrl = URL_API_STORAGE;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: {
      name: item.name,
      description: item.description,
      atLocationUuid: item.atLocationUuid,
      active: item.active,
      capacity: item.capacity,
    },
  });
}

// updateStorage
export function updateStorage(item: Storage) {
  const apiUrl = `${URL_API_STORAGE}/${item.uuid}`;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: {
      name: item.name,
      description: item.description,
      atLocationUuid: item.atLocationUuid,
      active: item.active,
      capacity: item.capacity,
    },
  });
}

export function deleteStorage(uuid: string, remarks: string) {
  const apiUrl = `${URL_API_STORAGE}/${uuid}`;
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

export function useLazyStorageUnits(defaultFilter: StorageFilter) {
  const [isLazy, setIsLazy] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState<StorageFilter>(
    () => defaultFilter
  );

  const [loaded, setLoaded] = useState<boolean>(false);

  const fetcher = () => {
    let apiUrl = `${URL_API_STORAGE_UNIT}${toQueryParams(searchCriteria)}`;
    return customOpenMRSFetch(apiUrl);
  };

  const { data, error, trigger, isMutating } = useSWRMutation<
    {
      data: PageableResult<Storage>;
    },
    Error
  >(`${URL_API_STORAGE_UNIT}`, fetcher);

  const getStorageUnits = useCallback(
    (filterCriteria) => {
      setSearchCriteria({
        ...(searchCriteria ?? {}),
        ...(filterCriteria ?? {}),
      });
      setIsLazy(false);
    },
    [searchCriteria]
  );

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

  return {
    getStorageUnits,
    items: data?.data || <PageableResult<Storage>>{},
    isLoading: false,
    isError: error,
    isValidating: isLazy ? false : isMutating,
    loaded,
  };
}
