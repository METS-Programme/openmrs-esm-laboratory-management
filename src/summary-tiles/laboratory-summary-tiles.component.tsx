import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./laboratory-summary-tiles.scss";
import {
  AssignedExtension,
  useConnectedExtensions,
  Extension,
} from "@openmrs/esm-framework";
import { ComponentContext } from "@openmrs/esm-framework/src/internal";
import { useDashboardMetrics } from "../api/dashboard-metrics.resource";
import { ResourceRepresentation } from "../api/resource-filter-criteria";
import { useOrderDate } from "../hooks/useOrderDate";
import { formatAsPlainEndOfDayDateForTransfer } from "../utils/date-utils";

const LaboratorySummaryTiles: React.FC = () => {
  const { t } = useTranslation();

  const labTileSlot = "lab-tiles-slot";

  const { currentOrdersDate } = useOrderDate();
  const [maxActivatedDate, setMaxActivatedDate] = useState<string>(
    formatAsPlainEndOfDayDateForTransfer(
      new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    )
  );
  const {
    items: { results },
  } = useDashboardMetrics({
    v: ResourceRepresentation.Full,
    minActivatedDate: currentOrdersDate,
    maxActivatedDate: maxActivatedDate,
  });

  const tileState = useMemo(() => {
    return {
      dashboardMetrics: results?.length > 0 ? results[0] : {},
    };
  }, [results]);

  const tilesExtensions = useConnectedExtensions(
    labTileSlot
  ) as AssignedExtension[];

  return (
    <div className={styles.cardContainer}>
      {tilesExtensions
        .filter((extension) => Object.keys(extension.meta).length > 0)
        .map((extension, index) => {
          return (
            <ComponentContext.Provider
              key={extension.id}
              value={{
                featureName: "LabTiles",
                moduleName: extension.moduleName,
                extension: {
                  extensionId: extension.id,
                  extensionSlotName: labTileSlot,
                  extensionSlotModuleName: extension.moduleName,
                },
              }}
            >
              <Extension state={tileState} />
            </ComponentContext.Provider>
          );
        })}
    </div>
  );
};

export default LaboratorySummaryTiles;
