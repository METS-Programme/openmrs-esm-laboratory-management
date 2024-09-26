import {
  ReferrerLocationFilter,
  useReferrerLocations,
} from "../../api/referrer-location.resource";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ResourceRepresentation } from "../../api/resource-filter-criteria";
import { usePagination } from "@openmrs/esm-framework";

export function useReferrerLocationResource(v?: ResourceRepresentation) {
  const { t } = useTranslation();

  const pageSizes = [10, 20, 30, 40, 50];
  const [searchString, setSearchString] = useState(null);
  const [currentPageSize, setPageSize] = useState(10);

  const [isReferrerIn, setReferrerIn] = useState<boolean>(undefined);
  const [isReferrerOut, setReferrerOut] = useState<boolean>(undefined);
  const [isActive, setActive] = useState<boolean>();
  const [loaded, setLoaded] = useState<boolean>(false);

  const [testConfigFilter, setReferrerLocationFilter] =
    useState<ReferrerLocationFilter>({
      v: v || ResourceRepresentation.Default,
      q: null,
      totalCount: true,
    });

  const { items, isLoading, isError, isValidating } =
    useReferrerLocations(testConfigFilter);
  const pagination = usePagination(items.results, currentPageSize);

  useEffect(() => {
    setReferrerLocationFilter({
      q: searchString,
      totalCount: true,
      active: isActive,
      referrerIn: isReferrerIn,
      referrerOut: isReferrerOut,
      v: ResourceRepresentation.Default,
    });
  }, [searchString, isActive, isReferrerIn, isReferrerOut]);

  useEffect(() => {
    if (!loaded && isLoading) {
      setLoaded(true);
    }
  }, [isLoading, loaded]);

  return {
    items: items?.results ?? [],
    currentPageSize,
    setPageSize,
    pagination,
    totalCount: items.totalCount,
    pageSizes,
    isLoading,
    isValidating,
    isError,
    isActive,
    setReferrerIn,
    setReferrerOut,
    isReferrerIn,
    isReferrerOut,
    setActive: (active?: boolean) => {
      setActive(active);
    },
    setSearchString,
    loaded,
  };
}
