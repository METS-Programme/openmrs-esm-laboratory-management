import { restBaseUrl } from "@openmrs/esm-framework";
import {
  ResourceFilterCriteria,
  toQueryParams,
} from "./resource-filter-criteria";
import { PageableResult } from "./types/pageable-result";
import useSWRMutation from "swr/mutation";
import useSWR, { mutate } from "swr";
import { useCallback, useEffect, useState } from "react";
import { User } from "./types/user";
import { customOpenMRSFetch } from "./custom-openmrs-fetch";

export interface UserFilterCriteria extends ResourceFilterCriteria {}

export function useUsers(filter: UserFilterCriteria) {
  const [searchCriteria, setSearchCriteria] = useState(filter);
  const getUsers = (filterCriteria) => {
    setSearchCriteria(filterCriteria);
  };

  const apiUrl = `${restBaseUrl}/user${toQueryParams(filter)}`;
  const { data, error, isLoading, isValidating } = useSWR<
    {
      data: PageableResult<User>;
    },
    Error
  >(apiUrl, customOpenMRSFetch, { revalidateOnFocus: false });

  return {
    getUsers,
    items: data?.data || <PageableResult<User>>{},
    isLoading: isLoading,
    isError: error,
    isValidating,
  };
}

export function useLazyUsers() {
  const [isLazy, setIsLazy] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState<UserFilterCriteria>();

  const fetcher = () => {
    let apiUrl = `${restBaseUrl}/user${toQueryParams(searchCriteria)}`;
    return customOpenMRSFetch(apiUrl);
  };

  const { data, error, trigger, isMutating } = useSWRMutation<
    {
      data: PageableResult<User>;
    },
    Error
  >(`${restBaseUrl}/concept`, fetcher);

  const getUsers = useCallback((filterCriteria) => {
    setSearchCriteria(filterCriteria);
    setIsLazy(false);
  }, []);

  useEffect(() => {
    if (!isLazy) {
      trigger();
    }
  }, [searchCriteria, isLazy, trigger]);

  return {
    getUsers,
    items: data?.data || <PageableResult<User>>{},
    isLoading: false,
    isError: error,
    isValidating: isLazy ? false : isMutating,
  };
}

export function useUser(userUuid: string) {
  const apiUrl = `${restBaseUrl}/user/${userUuid}`;
  const { data, error, isLoading } = useSWR<
    {
      data: User;
    },
    Error
  >(apiUrl, customOpenMRSFetch, { revalidateOnFocus: false });
  return {
    items: data?.data || <User>{},
    isLoading,
    isError: error,
  };
}

export function useLazyUser() {
  const [isLazy, setIsLazy] = useState(true);
  const [userUuid, setUserUuid] = useState<string>();
  const fetcher = () => {
    let apiUrl = `${restBaseUrl}/user/${userUuid}`;
    return customOpenMRSFetch(apiUrl);
  };

  const { data, error, trigger, isMutating } = useSWRMutation<
    {
      data: User;
    },
    Error
  >(`${restBaseUrl}/user/${userUuid}`, fetcher);

  const getUser = useCallback((uuid: string) => {
    setIsLazy(false);
    setUserUuid(uuid);
  }, []);

  useEffect(() => {
    if (!isLazy) {
      trigger();
    }
  }, [userUuid, isLazy, trigger]);

  return {
    getUser,
    items: data?.data || <User>{},
    isLoading: false,
    isError: error,
    isValidating: isLazy ? false : isMutating,
  };
}

export const otherUser: User = {
  uuid: "Other",
  display: "Other",
  person: {
    display: "Other",
  },
} as unknown as User;
