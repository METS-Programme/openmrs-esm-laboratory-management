import {
  ResourceFilterCriteria,
  toQueryParams,
} from "./resource-filter-criteria";
import useSWRMutation from "swr/mutation";
import { PageableResult } from "./types/pageable-result";
import { DashboardMetrics } from "./types/dashboard-metrics";
import { useCallback, useEffect, useState } from "react";
import { URL_API_DASHBOARD_METRICS } from "../config/urls";
import useSWR from "swr";
import { customOpenMRSFetch } from "./custom-openmrs-fetch";

export interface DashboardMetricFilter extends ResourceFilterCriteria {
  minActivatedDate?: Date | string;
  maxActivatedDate?: Date | string;
}

export function useDashboardMetrics(filter: DashboardMetricFilter) {
  const apiUrl = `${URL_API_DASHBOARD_METRICS}${toQueryParams(filter)}`;
  const { data, error, isLoading, isValidating } = useSWR<
    {
      data: PageableResult<DashboardMetrics>;
    },
    Error
  >(apiUrl, customOpenMRSFetch, { revalidateOnFocus: false });

  return {
    items: data?.data || <PageableResult<DashboardMetrics>>{},
    isLoading,
    isError: error,
    isValidating,
  };
}

export function useLazyDashboardMetrics() {
  const [isLazy, setIsLazy] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState<DashboardMetricFilter>();

  const fetcher = () => {
    let apiUrl = `${URL_API_DASHBOARD_METRICS}${toQueryParams(searchCriteria)}`;
    return customOpenMRSFetch(apiUrl);
  };

  const { data, error, trigger, isMutating } = useSWRMutation<
    {
      data: PageableResult<DashboardMetrics>;
    },
    Error
  >(`${URL_API_DASHBOARD_METRICS}`, fetcher);

  const getDashboardMetrics = useCallback((filterCriteria) => {
    setSearchCriteria(filterCriteria);
    setIsLazy(false);
  }, []);

  useEffect(() => {
    if (!isLazy) {
      trigger();
    }
  }, [searchCriteria, isLazy, trigger]);

  return {
    getDashboardMetrics,
    items: data?.data || <PageableResult<DashboardMetrics>>{},
    isLoading: false,
    isError: error,
    isValidating: isLazy ? false : isMutating,
  };
}
