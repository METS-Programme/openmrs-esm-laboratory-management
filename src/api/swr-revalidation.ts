import { mutate } from "swr";
import { URL_API_DASHBOARD_METRICS } from "../config/urls";
import debounce from "lodash-es/debounce";

const refreshDashboardMetrics = debounce(
  () =>
    mutate(
      (key) =>
        typeof key === "string" && key.startsWith(URL_API_DASHBOARD_METRICS),
      undefined,
      {
        revalidate: true,
      }
    ),
  300
);

export const handleMutate = (url: string) => {
  mutate((key) => typeof key === "string" && key.startsWith(url), undefined, {
    revalidate: true,
  });
  refreshDashboardMetrics();
};
