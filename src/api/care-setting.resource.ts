import { restBaseUrl } from "@openmrs/esm-framework";
import {
  ResourceFilterCriteria,
  toQueryParams,
} from "./resource-filter-criteria";
import { PageableResult } from "./types/pageable-result";
import useSWR from "swr";
import { useState } from "react";
import { CareSetting } from "./types/care-setting";
import { customOpenMRSFetch } from "./custom-openmrs-fetch";

export interface CareSettingFilterCriteria extends ResourceFilterCriteria {}

export function useCareSettings(filter: CareSettingFilterCriteria) {
  const [searchCriteria, setSearchCriteria] = useState(filter);
  const getCareSettings = (filterCriteria) => {
    setSearchCriteria(filterCriteria);
  };

  const apiUrl = `${restBaseUrl}/caresetting${toQueryParams(searchCriteria)}`;
  const { data, error, isLoading, isValidating } = useSWR<
    {
      data: PageableResult<CareSetting>;
    },
    Error
  >(apiUrl, customOpenMRSFetch, { revalidateOnFocus: false });

  return {
    setSearchCriteria,
    getCareSettings,
    items: data?.data || <PageableResult<CareSetting>>{},
    isLoading: isLoading,
    isError: error,
    isValidating,
  };
}
