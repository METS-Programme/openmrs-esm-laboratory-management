import { URL_API_WORKSHEET_URL } from "../config/urls";
import { customOpenMRSFetch } from "./custom-openmrs-fetch";
import { ResourceFilterCriteria } from "./resource-filter-criteria";

export interface WorksheetItemFilter extends ResourceFilterCriteria {}

// deleteWorksheetItem
export function deleteWorksheetItem(uuid: string, reason: string) {
  const apiUrl = URL_API_WORKSHEET_URL(uuid);
  const abortController = new AbortController();
  return customOpenMRSFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: {
      reason: reason,
    },
  });
}
