import { openmrsFetch } from "@openmrs/esm-framework";
import { URL_API_UGEMR_GENERATE_SAMPLE_BARCODE } from "../config/urls";

export async function GenerateSpecimenId(uuid?: string) {
  const abortController = new AbortController();
  return openmrsFetch(URL_API_UGEMR_GENERATE_SAMPLE_BARCODE(uuid), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });
}
