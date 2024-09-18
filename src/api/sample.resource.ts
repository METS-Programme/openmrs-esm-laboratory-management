import { usePagination } from "@openmrs/esm-framework";
import { URL_API_SAMPLE } from "../config/urls";
import {
  ResourceFilterCriteria,
  ResourceRepresentation,
  toQueryParams,
} from "./resource-filter-criteria";
import { PageableResult } from "./types/pageable-result";
import useSWR from "swr";
import { Sample } from "./types/sample";
import { useCallback, useEffect, useState } from "react";
import useSWRMutation from "swr/mutation";
import { useTranslation } from "react-i18next";
import { customOpenMRSFetch } from "./custom-openmrs-fetch";

export interface SampleFilter extends ResourceFilterCriteria {
  sample?: string;
  tests?: boolean;
  patient?: string;
  referralLocation?: string;
  sampleType?: string;
  minCollectionDate?: Date | string;
  maxCollectionDate?: Date | string;
  minActivatedDate?: Date | string;
  maxActivatedDate?: Date | string;
  sampleStatus?: string;
  storageStatus?: string;
  testRequestItemStatuses?: string;
  testRequest?: string;
  testConcept?: string;
  reference?: string;
  includeInStorage?: boolean;
  allTests?: boolean;
  location?: string;
  testItemlocation?: string;
  urgency?: string;
  referenceOrForWorksheet?: boolean;
  includeTestResultId?: boolean;
  forWorksheet?: boolean;
  storage?: string;
  repository?: boolean;
}

// deleteSample
export function deleteSample(uuid: string) {
  const apiUrl = `${URL_API_SAMPLE}/${uuid}`;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: {
      reason: "N/A",
    },
  });
}

// createSample
export function createSample(item: any) {
  const apiUrl = URL_API_SAMPLE;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: item,
  });
}

// updateSample
export function updateSample(uuid: string, item: any) {
  const apiUrl = `${URL_API_SAMPLE}/${uuid}`;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: item,
  });
}

export function useLazySample() {
  const [isLazy, setIsLazy] = useState(true);
  const [sampleUuid, setSampleUuid] = useState<string>();

  const fetcher = () => {
    let apiUrl = `${URL_API_SAMPLE}/${sampleUuid}`;
    return customOpenMRSFetch(apiUrl);
  };

  const { data, error, trigger, isMutating } = useSWRMutation<
    {
      data: Sample;
    },
    Error
  >(`${URL_API_SAMPLE}/undefined`, fetcher);

  const getSample = useCallback((uuid: string) => {
    setSampleUuid(uuid);
    setIsLazy(false);
  }, []);

  useEffect(() => {
    if (!isLazy) {
      trigger();
    }
  }, [isLazy, trigger]);

  return {
    getSample,
    item: data?.data || <Sample>{},
    isLoading: false,
    isError: error,
    isValidating: isLazy ? false : isMutating,
  };
}

export function useSamples(filter: SampleFilter) {
  const apiUrl = `${URL_API_SAMPLE}${toQueryParams(filter)}`;
  const { data, error, isLoading, isValidating } = useSWR<
    {
      data: PageableResult<Sample>;
    },
    Error
  >(apiUrl, customOpenMRSFetch, { revalidateOnFocus: false });

  return {
    items: data?.data || <PageableResult<Sample>>{},
    isLoading,
    isError: error,
    isValidating,
  };
}

export function useLazySamples(defaultFilter?: SampleFilter) {
  const [isLazy, setIsLazy] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState<SampleFilter>(
    () => defaultFilter
  );

  const fetcher = () => {
    let apiUrl = `${URL_API_SAMPLE}${toQueryParams(searchCriteria)}`;
    return customOpenMRSFetch(apiUrl);
  };

  const { data, error, trigger, isMutating } = useSWRMutation<
    {
      data: PageableResult<Sample>;
    },
    Error
  >(`${URL_API_SAMPLE}`, fetcher);

  const getSamples = useCallback((filterCriteria: SampleFilter) => {
    setSearchCriteria((e) => {
      return { ...(e ?? {}), ...(filterCriteria ?? {}) };
    });
    setIsLazy(false);
  }, []);

  useEffect(() => {
    if (!isLazy) {
      trigger();
    }
  }, [searchCriteria, isLazy, trigger]);

  return {
    getSamples,
    items: data?.data || <PageableResult<Sample>>{},
    isLoading: false,
    isError: error,
    isValidating: isLazy ? false : isMutating,
  };
}

export function useSampleResource(defaultFilters?: SampleFilter) {
  const { t } = useTranslation();

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPage, setCurrentPage] = useState(
    () => (defaultFilters?.startIndex ?? 0) + 1
  );
  const [currentPageSize, setPageSize] = useState(
    () => defaultFilters?.limit ?? 10
  );
  const [searchString, setSearchString] = useState(() => defaultFilters?.q);
  const [testItemLocation, setTestItemLocation] = useState(
    () => defaultFilters?.testItemlocation
  );
  const [testConcept, setTestConcept] = useState(
    () => defaultFilters?.testConcept
  );
  const [sampleRef, setSampleRef] = useState(() => defaultFilters?.reference);
  const [sampleType, setSampleType] = useState(
    () => defaultFilters?.sampleType
  );
  const [patientUuid, setPatientUuid] = useState(() => defaultFilters?.patient);
  const [minCollectionDate, setMinCollectionDate] = useState(
    () => defaultFilters?.minCollectionDate
  );
  const [maxCollectionDate, setMaxCollectionDate] = useState(
    defaultFilters?.maxCollectionDate
  );
  const [minActivatedDate, setMinActivatedDate] = useState(
    () => defaultFilters?.minActivatedDate
  );
  const [maxActivatedDate, setMaxActivatedDate] = useState(
    () => defaultFilters?.maxActivatedDate
  );
  const [urgency, setUrgency] = useState(() => defaultFilters?.urgency);
  const [referenceOrForWorksheet, setReferenceOrForWorksheet] = useState(
    () => defaultFilters?.referenceOrForWorksheet
  );
  const [forWorksheet, setForWorksheet] = useState(
    () => defaultFilters?.forWorksheet
  );

  const [storage, setStorage] = useState<string>();

  const [sampleStatus, setSampleStatus] = useState(() => null);

  const [testItemStatus, setTestItemStatus] = useState(() => null);
  const [storageStatus, setStorageStatus] = useState(() => null);

  const [loaded, setLoaded] = useState<boolean>(() => false);

  const [sampleFilter, setSampleFilter] = useState<SampleFilter>(() => {
    return {
      ...{
        startIndex: currentPage - 1,
        v: ResourceRepresentation.Default,
        limit: 10,
        q: null,
        totalCount: true,
        sort: "-id",
      },
      ...(defaultFilters ?? <SampleFilter>{}),
    };
  });

  const { items, isLoading, isError, isValidating } = useSamples(sampleFilter);
  const pagination = usePagination(items.results, currentPageSize);

  useEffect(() => {
    setSampleFilter((e) => {
      return {
        ...e,
        ...{
          startIndex: currentPage - 1,
          limit: currentPageSize,
          q: searchString,
          totalCount: e.totalCount,
          v: e.v,
          minCollectionDate: minCollectionDate,
          maxCollectionDate: maxCollectionDate,
          testItemlocation: testItemLocation,
          testConcept: testConcept,
          reference: sampleRef,
          patient: patientUuid,
          sampleType: sampleType,
          minActivatedDate: minActivatedDate,
          maxActivatedDate: maxActivatedDate,
          urgency: urgency,
          referenceOrForWorksheet: referenceOrForWorksheet,
          forWorksheet: forWorksheet,
          sampleStatus: sampleStatus,
          storage: storage,
          testRequestItemStatuses: testItemStatus,
          storageStatus: storageStatus,
        },
      };
    });
  }, [
    searchString,
    currentPage,
    currentPageSize,
    minCollectionDate,
    maxCollectionDate,
    testItemLocation,
    testConcept,
    sampleRef,
    patientUuid,
    sampleType,
    minActivatedDate,
    maxActivatedDate,
    urgency,
    referenceOrForWorksheet,
    forWorksheet,
    sampleStatus,
    storage,
    testItemStatus,
    storageStatus,
  ]);

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
    setSearchString,
    loaded,
    minCollectionDate,
    maxCollectionDate,
    setMinCollectionDate,
    setMaxCollectionDate,
    testItemLocation,
    setTestItemLocation,
    testConcept,
    setTestConcept,
    sampleRef,
    setSampleRef,
    patientUuid,
    setPatientUuid,
    minActivatedDate,
    maxActivatedDate,
    setMinActivatedDate,
    setMaxActivatedDate,
    sampleType,
    setSampleType,
    urgency,
    setUrgency,
    referenceOrForWorksheet,
    forWorksheet,
    setSampleStatus,
    sampleStatus,
    storage,
    setStorage,
    testItemStatus,
    setTestItemStatus,
    setStorageStatus,
    storageStatus,
  };
}
