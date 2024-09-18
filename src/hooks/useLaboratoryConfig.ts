import { useEffect, useState } from "react";
import { initialState, getLaboratoryStore, updateConfig } from "../store";
import { useLazyGlobalProperties } from "../api/global-property.resource";
import { ResourceRepresentation } from "../api/resource-filter-criteria";
import { useConfig } from "@openmrs/esm-framework";
import { Config } from "../config-schema";

export const useLaboratoryConfig = () => {
  const [configReady, setConfigReady] = useState(false);
  const esmConfig = useConfig<Config>();
  const { items: globalProperties, getGlobalProperties } =
    useLazyGlobalProperties();

  const [laboratoryConfig, setLaboratoryConfig] = useState(() => {
    const store = getLaboratoryStore();
    if (!store.getState()?.initialized) {
      getGlobalProperties({
        v: ResourceRepresentation.Default,
        q: "labmanagement",
      });
    } else {
      setConfigReady(true);
    }

    return store.getState()?.config ?? initialState.config;
  });

  useEffect(() => {
    if (!configReady && esmConfig && globalProperties?.results?.length > 0) {
      setLaboratoryConfig(updateConfig(esmConfig, globalProperties.results));
      setConfigReady(true);
    }
  }, [configReady, esmConfig, globalProperties]);

  return { laboratoryConfig, configReady };
};
