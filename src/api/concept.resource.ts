import { restBaseUrl } from "@openmrs/esm-framework";
import {
  ResourceFilterCriteria,
  toQueryParams,
} from "./resource-filter-criteria";
import { PageableResult } from "./types/pageable-result";
import useSWRMutation from "swr/mutation";
import useSWR, { mutate } from "swr";
import { useCallback, useEffect, useState } from "react";
import { Concept } from "./types/concept/concept";
import { customOpenMRSFetch } from "./custom-openmrs-fetch";

export interface ConceptFilterCriteria extends ResourceFilterCriteria {}

export function getConcept(uuid: string, filter: ConceptFilterCriteria) {
  const apiUrl = `${restBaseUrl}/concept/${uuid}${toQueryParams(filter)}`;
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });
}

export function useConcepts(filter: ConceptFilterCriteria) {
  const [searchCriteria, setSearchCriteria] = useState(filter);
  const getConcepts = (filterCriteria) => {
    setSearchCriteria(filterCriteria);
  };

  const apiUrl = `${restBaseUrl}/concept${toQueryParams(filter)}`;
  const { data, error, isLoading, isValidating } = useSWR<
    {
      data: PageableResult<Concept>;
    },
    Error
  >(apiUrl, customOpenMRSFetch, { revalidateOnFocus: false });

  return {
    getConcepts,
    items: data?.data || <PageableResult<Concept>>{},
    isLoading: isLoading,
    isError: error,
    isValidating,
  };
}

export function useLazyConcepts() {
  const [isLazy, setIsLazy] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState<ConceptFilterCriteria>();

  const fetcher = () => {
    let apiUrl = `${restBaseUrl}/concept${toQueryParams(searchCriteria)}`;
    return customOpenMRSFetch(apiUrl);
  };

  const { data, error, trigger, isMutating } = useSWRMutation<
    {
      data: PageableResult<Concept>;
    },
    Error
  >(`${restBaseUrl}/concept`, fetcher);

  const getConcepts = useCallback((filterCriteria) => {
    setSearchCriteria(filterCriteria);
    setIsLazy(false);
  }, []);

  useEffect(() => {
    if (!isLazy) {
      trigger();
    }
  }, [searchCriteria, isLazy, trigger]);

  return {
    getConcepts,
    items: data?.data || <PageableResult<Concept>>{},
    isLoading: false,
    isError: error,
    isValidating: isLazy ? false : isMutating,
  };
}

export function useConcept(conceptUuid: string) {
  const apiUrl = `${restBaseUrl}/concept/${conceptUuid}`;
  const { data, error, isLoading } = useSWR<
    {
      data: Concept;
    },
    Error
  >(apiUrl, customOpenMRSFetch, { revalidateOnFocus: false });
  return {
    items: data?.data || <Concept>{},
    isLoading,
    isError: error,
  };
}

export function useLazyConcept() {
  const [isLazy, setIsLazy] = useState(true);
  const [conceptUuid, setConceptUuid] = useState<string>();
  const fetcher = () => {
    let apiUrl = `${restBaseUrl}/concept/${conceptUuid}`;
    return customOpenMRSFetch(apiUrl);
  };

  const { data, error, trigger, isMutating } = useSWRMutation<
    {
      data: Concept;
    },
    Error
  >(`${restBaseUrl}/concept/${conceptUuid}`, fetcher);

  const getConcept = useCallback((uuid: string) => {
    setIsLazy(false);
    setConceptUuid(uuid);
  }, []);

  useEffect(() => {
    if (!isLazy) {
      trigger();
    }
  }, [conceptUuid, isLazy, trigger]);

  return {
    getConcept,
    items: data?.data || <Concept>{},
    isLoading: false,
    isError: error,
    isValidating: isLazy ? false : isMutating,
  };
}
