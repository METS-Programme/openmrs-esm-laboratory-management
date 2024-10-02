import {
  DataTable,
  DataTableSkeleton,
  Pagination,
  Table,
  TableBatchActions,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tile,
} from "@carbon/react";
import { isDesktop, useSession } from "@openmrs/esm-framework";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ResourceRepresentation } from "../../api/resource-filter-criteria";

import { useStorageUnitResource } from "./storage.resource";
import styles from "../../tests-ordered/laboratory-queue.scss";
import debounce from "lodash-es/debounce";

interface StorageUnitListProps {
  storageUuid?: string;
}

const StorageUnitList: React.FC<StorageUnitListProps> = ({ storageUuid }) => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const userSession = useSession();

  const {
    isLoading,
    items,
    totalCount,
    currentPageSize,
    pageSizes,
    currentPage,
    setCurrentPage,
    setPageSize,
    isActive,
    setActive,
    setSearchString,
    isValidating,
    loaded,
  } = useStorageUnitResource({
    v: ResourceRepresentation.Default,
    storage: storageUuid,
  });

  const debouncedSearch = useMemo(
    () => debounce((searchTerm) => setSearchString(searchTerm), 300),
    [setSearchString]
  );

  const handleSearch = (query: string) => {
    setSearchInput(query);
    debouncedSearch(query);
  };

  const tableHeaders = useMemo(
    () => [
      {
        id: 1,
        header: t("laboratoryStorageName", "Name"),
        key: "name",
      },
      {
        id: 3,
        header: t("laboratoryStorageActive", "Active"),
        key: "active",
      },
    ],
    [t]
  );

  const tableRows = useMemo(() => {
    return items?.map((storageUnit, index) => ({
      id: storageUnit?.uuid,
      key: `key-${storageUnit?.uuid}`,
      uuid: `${storageUnit?.uuid}`,
      name: storageUnit.unitName,
      active: storageUnit?.active ? t("yes", "Yes") : t("no", "No"),
    }));
  }, [items, t]);

  if (isLoading && !loaded) {
    // eslint-disable-next-line no-console
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <>
      <DataTable
        rows={tableRows}
        headers={tableHeaders}
        isSortable
        useZebraStyles
        render={({
          rows,
          headers,
          getHeaderProps,
          getTableProps,
          getRowProps,
          getBatchActionProps,
        }) => (
          <TableContainer
            className={`${styles.tableContainer} ${styles.fillContainer}`}
          >
            <TableToolbar
              style={{
                position: "static",
                margin: 0,
              }}
            >
              <TableBatchActions {...getBatchActionProps()}></TableBatchActions>
              <TableToolbarContent
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <TableToolbarSearch
                  persistent
                  value={searchInput}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
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
                          isSortable={header.key !== "name"}
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
                        className={
                          isDesktop ? styles.desktopRow : styles.tabletRow
                        }
                        {...getRowProps({ row })}
                        key={row.id}
                      >
                        {row.cells.map(
                          (cell) =>
                            cell?.info?.header !== "details" && (
                              <TableCell key={cell.id}>{cell.value}</TableCell>
                            )
                        )}
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
            {rows.length === 0 ? (
              <div className={styles.tileContainer}>
                <Tile className={styles.tile}>
                  <div className={styles.tileContent}>
                    <p className={styles.content}>
                      {t(
                        "noStorageUnitsToDisplay",
                        "No storage units to display"
                      )}
                    </p>
                    <p className={styles.helper}>
                      {t("checkFilters", "Check the filters above")}
                    </p>
                  </div>
                </Tile>
              </div>
            ) : null}
          </TableContainer>
        )}
      ></DataTable>

      <Pagination
        page={currentPage}
        pageSize={currentPageSize}
        pageSizes={pageSizes}
        totalItems={totalCount ?? 0}
        onChange={({ page, pageSize }) => {
          setCurrentPage(page);
          setPageSize(pageSize);
        }}
        className={styles.paginationOverride}
      />
    </>
  );
};

export default StorageUnitList;
