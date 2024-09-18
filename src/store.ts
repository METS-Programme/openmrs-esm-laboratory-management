import { getGlobalStore, Type } from "@openmrs/esm-framework";
import dayjs from "dayjs";
import { omrsDateFormat } from "./constants";
import { Config, configSchema } from "./config-schema";
import { GlobalProperty } from "./api/types/global-property";

export interface LaboratoryState {
  ordersDate: string | Date;
  config: Config;
  initialized: boolean;
}

// orders date globally
export const initialState = {
  ordersDate: dayjs(new Date().setHours(0, 0, 0, 0) - 7 * 86400000).format(
    omrsDateFormat
  ),
  config: {} as any as Config,
  initialized: false,
};

export function getLaboratoryStore() {
  return getGlobalStore<LaboratoryState>(
    "laboratoryOrdersStartDate",
    initialState
  );
}

export function changeStartDate(updatedDate: string | Date) {
  const store = getLaboratoryStore();
  store.setState({
    ordersDate: dayjs(new Date(updatedDate).setHours(0, 0, 0, 0)).format(
      omrsDateFormat
    ),
  });
}

export function updateConfig(
  esmConfig: Config,
  systemSettings: Array<GlobalProperty>
) {
  let config: Config = {} as any as Config;
  let systemSettingsMap = systemSettings.reduce((prev, curr) => {
    prev[curr.property] = curr;
    return prev;
  }, {});
  Object.entries(configSchema).map(([k, v]) => {
    config[k] = esmConfig[k] ?? v._default;
    if (v._globalProperty && systemSettingsMap[v._globalProperty]) {
      let settingVale = systemSettingsMap[v._globalProperty].value;
      if (v._type == Type.Boolean) {
        config[k] =
          settingVale &&
          (settingVale.toLowerCase() == "true" || settingVale == "1");
      } else {
        config[k] = settingVale;
      }
    }
  });
  const store = getLaboratoryStore();
  store.setState({
    config: config,
    initialized: true,
  });
  return config;
}
