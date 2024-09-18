import { restBaseUrl } from "@openmrs/esm-framework";
import {
  ResourceFilterCriteria,
  toQueryParams,
} from "./resource-filter-criteria";
import { PageableResult } from "./types/pageable-result";
import useSWRMutation from "swr/mutation";
import useSWR, { mutate } from "swr";
import { useCallback, useEffect, useState } from "react";
import { Provider } from "./types/provider";
import { customOpenMRSFetch } from "./custom-openmrs-fetch";

export interface ProviderFilterCriteria extends ResourceFilterCriteria {}

export function useProviders(filter: ProviderFilterCriteria) {
  const [searchCriteria, setSearchCriteria] = useState(filter);
  const getProviders = (filterCriteria) => {
    setSearchCriteria(filterCriteria);
  };

  const apiUrl = `${restBaseUrl}/provider${toQueryParams(filter)}`;
  const { data, error, isLoading, isValidating } = useSWR<
    {
      data: PageableResult<Provider>;
    },
    Error
  >(apiUrl, customOpenMRSFetch, { revalidateOnFocus: false });

  return {
    getProviders,
    items: data?.data || <PageableResult<Provider>>{},
    isLoading: isLoading,
    isError: error,
    isValidating,
  };
}

export function useLazyProviders() {
  const [isLazy, setIsLazy] = useState(true);
  const [searchCriteria, setSearchCriteria] =
    useState<ProviderFilterCriteria>();

  const fetcher = () => {
    let apiUrl = `${restBaseUrl}/provider${toQueryParams(searchCriteria)}`;
    return customOpenMRSFetch(apiUrl);
  };

  const { data, error, trigger, isMutating } = useSWRMutation<
    {
      data: PageableResult<Provider>;
    },
    Error
  >(`${restBaseUrl}/provider`, fetcher);

  const getProviders = useCallback((filterCriteria) => {
    setSearchCriteria(filterCriteria);
    setIsLazy(false);
  }, []);

  useEffect(() => {
    if (!isLazy) {
      trigger();
    }
  }, [searchCriteria, isLazy, trigger]);

  return {
    getProviders,
    items: data?.data || <PageableResult<Provider>>{},
    isLoading: false,
    isError: error,
    isValidating: isLazy ? false : isMutating,
  };
}

export function useProvider(providerUuid: string) {
  const apiUrl = `${restBaseUrl}/provider/${providerUuid}`;
  const { data, error, isLoading } = useSWR<
    {
      data: Provider;
    },
    Error
  >(apiUrl, customOpenMRSFetch, { revalidateOnFocus: false });
  return {
    items: data?.data || <Provider>{},
    isLoading,
    isError: error,
  };
}
