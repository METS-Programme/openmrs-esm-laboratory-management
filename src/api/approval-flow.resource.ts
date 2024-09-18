import {
  ResourceFilterCriteria,
  toQueryParams,
} from "./resource-filter-criteria";
import useSWRMutation from "swr/mutation";
import { PageableResult } from "./types/pageable-result";
import { ApprovalFlow } from "./types/approval-flow";
import { useCallback, useEffect, useState } from "react";
import { URL_API_APPROVAL_FLOW } from "../config/urls";
import useSWR from "swr";
import { customOpenMRSFetch } from "./custom-openmrs-fetch";

export interface ApprovalFlowFilter extends ResourceFilterCriteria {
  name?: boolean | null;
}

export function useApprovalFlows(filter: ApprovalFlowFilter) {
  const apiUrl = `${URL_API_APPROVAL_FLOW}${toQueryParams(filter)}`;
  const { data, error, isLoading, isValidating } = useSWR<
    {
      data: PageableResult<ApprovalFlow>;
    },
    Error
  >(apiUrl, customOpenMRSFetch, { revalidateOnFocus: false });

  return {
    items: data?.data || <PageableResult<ApprovalFlow>>{},
    isLoading,
    isError: error,
    isValidating,
  };
}

export function useLazyApprovalFlows() {
  const [isLazy, setIsLazy] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState<ApprovalFlowFilter>();

  const fetcher = () => {
    let apiUrl = `${URL_API_APPROVAL_FLOW}${toQueryParams(searchCriteria)}`;
    return customOpenMRSFetch(apiUrl);
  };

  const { data, error, trigger, isMutating } = useSWRMutation<
    {
      data: PageableResult<ApprovalFlow>;
    },
    Error
  >(`${URL_API_APPROVAL_FLOW}`, fetcher);

  const getApprovalFlows = useCallback((filterCriteria) => {
    setSearchCriteria(filterCriteria);
    setIsLazy(false);
  }, []);

  useEffect(() => {
    if (!isLazy) {
      trigger();
    }
  }, [searchCriteria, isLazy, trigger]);

  return {
    getApprovalFlows,
    items: data?.data || <PageableResult<ApprovalFlow>>{},
    isLoading: false,
    isError: error,
    isValidating: isLazy ? false : isMutating,
  };
}

// createApprovalFlow
export function createApprovalFlow(item: ApprovalFlow) {
  const apiUrl = URL_API_APPROVAL_FLOW;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: {
      name: item.name,
      systemName: item.systemName,
      levelOneUuid: item.levelOneUuid,
      levelOneAllowOwner: item.levelOneAllowOwner,
      levelTwoUuid: item.levelTwoUuid ? item.levelTwoUuid : null,
      levelTwoAllowOwner: item.levelTwoUuid ? item.levelTwoAllowOwner : null,
      levelThreeUuid: item.levelThreeUuid ? item.levelThreeUuid : null,
      levelThreeAllowOwner: item.levelThreeUuid
        ? item.levelThreeAllowOwner
        : null,
      levelFourUuid: item.levelFourUuid ? item.levelFourUuid : null,
      levelFourAllowOwner: item.levelFourUuid ? item.levelFourAllowOwner : null,
      levelTwoAllowPrevious: item.levelTwoUuid
        ? item.levelTwoAllowPrevious
        : null,
      levelThreeAllowPrevious: item.levelThreeUuid
        ? item.levelThreeAllowPrevious
        : null,
      levelFourAllowPrevious: item.levelFourUuid
        ? item.levelFourAllowPrevious
        : null,
    },
  });
}

// updateApprovalFlow
export function updateApprovalFlow(item: ApprovalFlow) {
  const apiUrl = `${URL_API_APPROVAL_FLOW}/${item.uuid}`;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: {
      name: item.name,
      systemName: item.systemName,
      levelOneUuid: item.levelOneUuid,
      levelOneAllowOwner: item.levelOneAllowOwner,
      levelTwoUuid: item.levelTwoUuid ? item.levelTwoUuid : null,
      levelTwoAllowOwner: item.levelTwoUuid ? item.levelTwoAllowOwner : null,
      levelThreeUuid: item.levelThreeUuid ? item.levelThreeUuid : null,
      levelThreeAllowOwner: item.levelThreeUuid
        ? item.levelThreeAllowOwner
        : null,
      levelFourUuid: item.levelFourUuid ? item.levelFourUuid : null,
      levelFourAllowOwner: item.levelFourUuid ? item.levelFourAllowOwner : null,
      levelTwoAllowPrevious: item.levelTwoUuid
        ? item.levelTwoAllowPrevious
        : null,
      levelThreeAllowPrevious: item.levelThreeUuid
        ? item.levelThreeAllowPrevious
        : null,
      levelFourAllowPrevious: item.levelFourUuid
        ? item.levelFourAllowPrevious
        : null,
    },
  });
}
