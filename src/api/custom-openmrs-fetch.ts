import {
  FetchConfig,
  FetchResponse,
  openmrsFetch,
  usePagination,
} from "@openmrs/esm-framework";

export function customOpenMRSFetch<T = any>(
  path: string,
  fetchInit: FetchConfig = {}
): Promise<FetchResponse<T>> {
  if (fetchInit) {
    if (!fetchInit.headers) {
      fetchInit.headers = {};
    }
    fetchInit.cache = "no-store";
  }
  return openmrsFetch(path, fetchInit);
}
