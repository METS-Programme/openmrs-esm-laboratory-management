import {
  StorageFilter,
  useStorages,
  useStorageUnits,
} from "../../api/storage.resource";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ResourceRepresentation } from "../../api/resource-filter-criteria";
import { usePagination } from "@openmrs/esm-framework";

export function useStorageResource(v?: ResourceRepresentation) {
  const { t } = useTranslation();

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setPageSize] = useState(10);
  const [searchString, setSearchString] = useState(null);
  const [atLocation, setAtLocation] = useState(null);

  const [isActive, setActive] = useState<boolean>();
  const [loaded, setLoaded] = useState<boolean>(false);

  const [testConfigFilter, setStorageFilter] = useState<StorageFilter>({
    startIndex: currentPage - 1,
    v: v || ResourceRepresentation.Default,
    limit: 10,
    q: null,
    totalCount: true,
  });

  const { items, isLoading, isError, isValidating } =
    useStorages(testConfigFilter);
  const pagination = usePagination(items.results, currentPageSize);

  useEffect(() => {
    setStorageFilter((e) => {
      return {
        ...e,
        ...{
          startIndex: currentPage - 1,
          limit: currentPageSize,
          q: searchString,
          totalCount: true,
          v: ResourceRepresentation.Default,
          location: atLocation,
        },
      };
    });
  }, [searchString, currentPage, currentPageSize, isActive, atLocation]);

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
    isActive,
    setActive: (active?: boolean) => {
      setCurrentPage(1);
      setActive(active);
    },
    setSearchString,
    loaded,
    setAtLocation: (locationUuid?: string) => {
      setCurrentPage(1);
      setAtLocation(locationUuid);
    },
    atLocation,
  };
}

export function useStorageUnitResource(defaultFilter: StorageFilter) {
  const { t } = useTranslation();

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setPageSize] = useState(10);
  const [searchString, setSearchString] = useState(null);
  const [storage, setStorage] = useState(defaultFilter?.storage);

  const [isActive, setActive] = useState<boolean>(
    defaultFilter?.active ?? null
  );
  const [loaded, setLoaded] = useState<boolean>(false);

  const [testConfigFilter, setStorageFilter] = useState<StorageFilter>(() => {
    return {
      ...{
        startIndex: currentPage - 1,
        v: defaultFilter?.v ?? ResourceRepresentation.Default,
        limit: defaultFilter?.limit ?? 10,
        q: null,
        totalCount: true,
      },
      ...defaultFilter,
    };
  });

  const { items, isLoading, isError, isValidating } =
    useStorageUnits(testConfigFilter);
  const pagination = usePagination(items.results, currentPageSize);

  useEffect(() => {
    setStorageFilter((e) => {
      return {
        ...e,
        ...{
          startIndex: currentPage - 1,
          limit: currentPageSize,
          q: searchString,
          totalCount: true,
          v: ResourceRepresentation.Default,
          storage: storage,
        },
      };
    });
  }, [searchString, currentPage, currentPageSize, isActive, storage]);

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
    isActive,
    setActive: (active?: boolean) => {
      setCurrentPage(1);
      setActive(active);
    },
    setSearchString,
    loaded,
    setStorage: (storageUuid?: string) => {
      setCurrentPage(1);
      setStorage(storageUuid);
    },
    storage,
  };
}
