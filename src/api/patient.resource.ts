import { restBaseUrl } from "@openmrs/esm-framework";
import {
  ResourceFilterCriteria,
  toQueryParams,
} from "./resource-filter-criteria";
import { PageableResult } from "./types/pageable-result";
import useSWRMutation from "swr/mutation";
import useSWR, { mutate } from "swr";
import { useCallback, useEffect, useState } from "react";
import { Patient } from "./types/patient";
import { customOpenMRSFetch } from "./custom-openmrs-fetch";

export interface PatientFilterCriteria extends ResourceFilterCriteria {
  includeDead?: boolean;
}

export function getPatient(uuid: string, filter: PatientFilterCriteria) {
  const apiUrl = `${restBaseUrl}/patient/${uuid}${toQueryParams(filter)}`;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });
}

export function useLazyPatients() {
  const [isLazy, setIsLazy] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState<PatientFilterCriteria>();

  const fetcher = () => {
    let apiUrl = `${restBaseUrl}/patient${toQueryParams(searchCriteria)}`;
    return customOpenMRSFetch(apiUrl);
  };

  const { data, error, trigger, isMutating } = useSWRMutation<
    {
      data: PageableResult<Patient>;
    },
    Error
  >(`${restBaseUrl}/patient`, fetcher);

  const getPatients = useCallback((filterCriteria) => {
    setSearchCriteria(filterCriteria);
    setIsLazy(false);
  }, []);

  useEffect(() => {
    if (!isLazy) {
      trigger();
    }
  }, [searchCriteria, isLazy, trigger]);

  return {
    getPatients,
    items: data?.data || <PageableResult<Patient>>{},
    isLoading: false,
    isError: error,
    isValidating: isLazy ? false : isMutating,
  };
}
