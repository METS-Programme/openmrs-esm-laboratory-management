import {
  ApprovalConfigFilter,
  useApprovalConfigs,
} from "../../api/approval-config.resource";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ResourceRepresentation } from "../../api/resource-filter-criteria";
import { usePagination } from "@openmrs/esm-framework";

export function useApprovalConfigResource(v?: ResourceRepresentation) {
  const { t } = useTranslation();

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setPageSize] = useState(10);
  const [searchString, setSearchString] = useState(null);

  const [isActive, setActive] = useState<boolean>();
  const [loaded, setLoaded] = useState<boolean>(false);

  const [testConfigFilter, setApprovalConfigFilter] =
    useState<ApprovalConfigFilter>({
      startIndex: currentPage - 1,
      v: v || ResourceRepresentation.Default,
      limit: 10,
      q: null,
      totalCount: true,
    });

  const { items, isLoading, isError, isValidating } =
    useApprovalConfigs(testConfigFilter);
  const pagination = usePagination(items.results, currentPageSize);

  useEffect(() => {
    setApprovalConfigFilter({
      startIndex: currentPage - 1,
      limit: currentPageSize,
      q: searchString,
      totalCount: true,
      v: ResourceRepresentation.Default,
    });
  }, [searchString, currentPage, currentPageSize, isActive]);

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
  };
}
