import { GetGenerateIdentifierApiUrl } from "../config/urls";
import { customOpenMRSFetch } from "./custom-openmrs-fetch";

export function idGenGenerateId(identifierSourceUuid: string) {
  const apiUrl = GetGenerateIdentifierApiUrl(identifierSourceUuid);
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: {},
  });
}
