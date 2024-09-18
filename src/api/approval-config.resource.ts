import {
  ResourceFilterCriteria,
  toQueryParams,
} from "./resource-filter-criteria";
import useSWRMutation from "swr/mutation";
import { PageableResult } from "./types/pageable-result";
import { ApprovalConfig } from "./types/approval-config";
import { useCallback, useEffect, useState } from "react";
import { URL_API_APPROVAL_CONFIG } from "../config/urls";
import useSWR from "swr";
import { customOpenMRSFetch } from "./custom-openmrs-fetch";

export interface ApprovalConfigFilter extends ResourceFilterCriteria {
  name?: boolean | null;
}

export function useApprovalConfigs(filter: ApprovalConfigFilter) {
  const apiUrl = `${URL_API_APPROVAL_CONFIG}${toQueryParams(filter)}`;
  const { data, error, isLoading, isValidating } = useSWR<
    {
      data: PageableResult<ApprovalConfig>;
    },
    Error
  >(apiUrl, customOpenMRSFetch, { revalidateOnFocus: false });

  return {
    items: data?.data || <PageableResult<ApprovalConfig>>{},
    isLoading,
    isError: error,
    isValidating,
  };
}

export function useLazyApprovalConfigs() {
  const [isLazy, setIsLazy] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState<ApprovalConfigFilter>();

  const fetcher = () => {
    let apiUrl = `${URL_API_APPROVAL_CONFIG}${toQueryParams(searchCriteria)}`;
    return customOpenMRSFetch(apiUrl);
  };

  const { data, error, trigger, isMutating } = useSWRMutation<
    {
      data: PageableResult<ApprovalConfig>;
    },
    Error
  >(`${URL_API_APPROVAL_CONFIG}`, fetcher);

  const getApprovalConfigs = useCallback((filterCriteria) => {
    setSearchCriteria(filterCriteria);
    setIsLazy(false);
  }, []);

  useEffect(() => {
    if (!isLazy) {
      trigger();
    }
  }, [searchCriteria, isLazy, trigger]);

  return {
    getApprovalConfigs,
    items: data?.data || <PageableResult<ApprovalConfig>>{},
    isLoading: false,
    isError: error,
    isValidating: isLazy ? false : isMutating,
  };
}

// createApprovalConfig
export function createApprovalConfig(item: ApprovalConfig) {
  const apiUrl = URL_API_APPROVAL_CONFIG;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: {
      approvalTitle: item.approvalTitle,
      privilege: item.privilege,
      pendingStatus: item.pendingStatus,
      returnedStatus: item.returnedStatus,
      rejectedStatus: item.rejectedStatus,
      approvedStatus: item.approvedStatus,
    },
  });
}

// updateApprovalConfig
export function updateApprovalConfig(item: ApprovalConfig) {
  const apiUrl = `${URL_API_APPROVAL_CONFIG}/${item.uuid}`;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: {
      approvalTitle: item.approvalTitle,
      privilege: item.privilege,
      pendingStatus: item.pendingStatus,
      returnedStatus: item.returnedStatus,
      rejectedStatus: item.rejectedStatus,
      approvedStatus: item.approvedStatus,
    },
  });
}
