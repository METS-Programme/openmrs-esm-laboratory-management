import {
  TestConfigFilter,
  useTestConfigs,
} from "../../api/test-config.resource";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ResourceRepresentation } from "../../api/resource-filter-criteria";
import { usePagination } from "@openmrs/esm-framework";

export function useTestConfigResource(v?: ResourceRepresentation) {
  const { t } = useTranslation();

  const pageSizes = [10, 20, 30, 40, 50];
  const [searchString, setSearchString] = useState(null);
  const [currentPageSize, setPageSize] = useState(10);

  const [isActive, setActive] = useState<boolean>();
  const [loaded, setLoaded] = useState<boolean>(false);

  const [testConfigFilter, setTestConfigFilter] = useState<TestConfigFilter>({
    v: v || ResourceRepresentation.Default,
    q: null,
    totalCount: true,
  });

  const { items, isLoading, isError, isValidating } =
    useTestConfigs(testConfigFilter);
  const pagination = usePagination(items.results, currentPageSize);

  useEffect(() => {
    setTestConfigFilter({
      q: searchString,
      totalCount: true,
      active: isActive,
      v: ResourceRepresentation.Default,
    });
  }, [searchString, isActive]);

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
    setActive: (active?: boolean) => {
      setActive(active);
    },
    setSearchString,
    loaded,
  };
}
