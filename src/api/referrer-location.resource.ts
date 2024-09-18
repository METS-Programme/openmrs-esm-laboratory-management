import {
  ResourceFilterCriteria,
  toQueryParams,
} from "./resource-filter-criteria";
import useSWR from "swr";
import { PageableResult } from "./types/pageable-result";
import { ReferrerLocation } from "./types/referrer-location";
import { URL_API_REFERRER_LOCATION } from "../config/urls";
import { customOpenMRSFetch } from "./custom-openmrs-fetch";

export interface ReferrerLocationFilter extends ResourceFilterCriteria {
  referrerIn?: boolean | null;
  referrerOut?: boolean | null;
  active?: boolean | null;
  concept?: string | null;
  patient?: string | null;
}

export function useReferrerLocations(filter: ReferrerLocationFilter) {
  const apiUrl = `${URL_API_REFERRER_LOCATION}${toQueryParams(filter)}`;
  const { data, error, isLoading, isValidating } = useSWR<
    {
      data: PageableResult<ReferrerLocation>;
    },
    Error
  >(apiUrl, customOpenMRSFetch, { revalidateOnFocus: false });

  return {
    items: data?.data || <PageableResult<ReferrerLocation>>{},
    isLoading,
    isError: error,
    isValidating,
  };
}

// createReferrerLocation
export function createReferrerLocation(item: ReferrerLocation) {
  const apiUrl = URL_API_REFERRER_LOCATION;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: {
      referrerIn: item.referrerIn,
      referrerOut: item.referrerOut,
      enabled: item.enabled,
      conceptUuid: item.conceptUuid,
      patientUuid: item.patientUuid,
      name: item.name,
      acronym: item.acronym,
    },
  });
}

// updateReferrerLocation
export function updateReferrerLocation(item: ReferrerLocation) {
  const apiUrl = `${URL_API_REFERRER_LOCATION}/${item.uuid}`;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: {
      referrerIn: item.referrerIn,
      referrerOut: item.referrerOut,
      enabled: item.enabled,
      conceptUuid: item.conceptUuid,
      patientUuid: item.patientUuid,
      name: item.name,
      acronym: item.acronym,
    },
  });
}
