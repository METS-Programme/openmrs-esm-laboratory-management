import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
  DataTableSkeleton,
} from "@carbon/react";
import { formatDate, isDesktop, parseDate } from "@openmrs/esm-framework";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../tests-ordered/laboratory-queue.scss";
import { useSampleActivityResource } from "../../api/sample-activity.resource";
import { ResourceRepresentation } from "../../api/resource-filter-criteria";
import {
  formatDateForDisplay,
  formatDateTimeForDisplay,
} from "../../utils/date-utils";

interface SampleActivityListProps {
  sampleUuid: string;
}

const SampleActivityList: React.FC<SampleActivityListProps> = ({
  sampleUuid,
}) => {
  const { t } = useTranslation();

  const { items, isLoading, loaded } = useSampleActivityResource({
    v: ResourceRepresentation.Default,
    sample: sampleUuid,
    limit: 10,
  });
  const testTableHeaders = [
    {
      id: 1,
      header: t("activity", "Activity"),
      key: "activityType",
    },
    {
      id: 0,
      header: t("laboratorySampleActivityDate", "Date"),
      key: "activityDate",
    },
    {
      id: 12,
      header: t("laboratorySampleStorageUnit", "Storage"),
      key: "storage",
    },
    {
      id: 2,
      header: t("thawCycles", "Thaw Cycles"),
      key: "thawCycles",
    },
    {
      id: 3,
      header: t("volume", "Volume"),
      key: "volume",
    },
    { id: 4, header: t("remarks", "Remarks"), key: "remarks" },
    { id: 6, header: "Responsible Person", key: "responsiblePerson" },
  ];

  const tableRows = useMemo(() => {
    return items?.map((entry) => ({
      id: entry.uuid,
      activityDate: (
        <span className={styles["single-line-display"]}>
          {formatDateForDisplay(entry?.activityDate ?? entry.dateCreated)}
        </span>
      ),
      activityType: t(entry.activityType),
      storage: entry.storageUnitName
        ? `${entry.storageName}/${entry.storageUnitName}`
        : "",
      thawCycles: entry.thawCycles ?? "N/A",
      volume: entry.volume
        ? `${entry.volume?.toLocaleString() ?? ""}${entry.volumeUnitName ?? ""}`
        : "N/A",
      remarks: (
        <div>
          {entry.remarks}
          <div className={styles.italic}>
            {t("recordedBy", "Recorded By")}{" "}
            <strong>
              {entry.activityByFamilyName} {entry.activityByMiddleName}{" "}
              {entry.activityByGivenName}
            </strong>{" "}
            {t("on", "On")}{" "}
            <strong>{formatDateTimeForDisplay(entry.dateCreated)}</strong>
          </div>
        </div>
      ),
      responsiblePerson: `${entry.responsiblePersonFamilyName ?? ""} ${
        entry.responsiblePersonMiddleName ?? ""
      } ${entry.responsiblePersonGivenName ?? ""}`,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  if (isLoading && !loaded) {
    // eslint-disable-next-line no-console
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <>
      <DataTable
        rows={tableRows}
        headers={testTableHeaders}
        isSortable
        useZebraStyles
        overflowMenuOnHover={true}
        render={({
          rows,
          headers,
          getHeaderProps,
          getTableProps,
          getRowProps,
        }) => {
          return (
            <TableContainer className={styles.tableContainer}>
              <Table
                {...getTableProps()}
                className={styles.activePatientsTable}
              >
                <TableHead>
                  <TableRow>
                    {headers.map(
                      (header) =>
                        header.key !== "details" && (
                          <TableHeader
                            {...getHeaderProps({
                              header,
                              isSortable: header.isSortable,
                            })}
                            className={
                              isDesktop
                                ? styles.desktopHeader
                                : styles.tabletHeader
                            }
                            key={`${header.key}`}
                          >
                            {header.header?.content ?? header.header}
                          </TableHeader>
                        )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => {
                    return (
                      <React.Fragment key={row.id}>
                        <TableRow
                          className={`${
                            isDesktop ? styles.desktopRow : styles.tabletRow
                          }`}
                          {...getRowProps({ row })}
                          key={row.id}
                          id={`tr-test-${row.id}`}
                        >
                          {row.cells.map(
                            (cell) =>
                              cell?.info?.header !== "details" && (
                                <TableCell key={cell.id}>
                                  {cell.value}
                                </TableCell>
                              )
                          )}
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
              {(rows?.length ?? 0) === 0 ? (
                <div className={styles.tileContainer}>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>
                        {t(
                          "noSampleActivityTestsToDisplay",
                          "No sample activity to display"
                        )}
                      </p>
                    </div>
                  </Tile>
                </div>
              ) : null}
            </TableContainer>
          );
        }}
      ></DataTable>
    </>
  );
};

export default SampleActivityList;
