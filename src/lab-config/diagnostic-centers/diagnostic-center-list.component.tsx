import {
  TabPanel,
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
  TableToolbarMenu,
  Select,
  TableToolbarAction,
  SelectItem,
} from "@carbon/react";
import {
  isDesktop,
  useConfig,
  useSession,
  userHasAccess,
} from "@openmrs/esm-framework";
import React, { useMemo, useState, useEffect, ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { ResourceRepresentation } from "../../api/resource-filter-criteria";
import styles from "./diagnostic-center-list.scss";
import debounce from "lodash-es/debounce";
import { MANAGE_LOCATIONS } from "../../config/openmrsPriviledges";
import {
  useOpenMRSLocationResource,
  useOpenMRSLocationTags,
} from "../../api/location.resource";
import EditDiagnosticCenterLinkButton from "./edit-diagnostic-center-action-link-button.component";
import DeleteDiagnosticCenterActionButton from "./delete-diagnostic-center-action-button.component";
import AddApprovalFlowActionButton from "./add-diagnostic-center-action-button.component";
import { Config } from "../../config-schema";

interface DiagnosticCenterListProps {}

const DiagnosticCenterList: React.FC<DiagnosticCenterListProps> = () => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const userSession = useSession();
  const [canEdit, setCanEdit] = useState(false);

  const {
    laboratoryLocationTagUuid,
    laboratoryLocationTag,
    laboratoryMainLocationTag,
  } = useConfig<Config>();

  useEffect(
    () => {
      setCanEdit(
        userSession?.user && userHasAccess(MANAGE_LOCATIONS, userSession.user)
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const {
    isLoading,
    items,
    totalCount,
    currentPageSize,
    pageSizes,
    currentPage,
    setCurrentPage,
    setPageSize,
    setSearchString,
    isValidating,
    loaded,
    refresh,
    locationTag,
    setLocationTag,
  } = useOpenMRSLocationResource({
    totalCount: true,
    v: ResourceRepresentation.Default,
    limit: 50,
    q: "",
    tag: laboratoryLocationTagUuid,
  });

  const { items: locationTags } = useOpenMRSLocationTags(null);

  const debouncedSearch = useMemo(
    () => debounce((searchTerm) => setSearchString(searchTerm ?? ""), 300),
    [setSearchString]
  );

  const handleSearch = (query: string) => {
    setSearchInput(query ?? "");
    debouncedSearch(query);
  };

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: t("laboratoryDiagnosticCenterName", "Name"),
        key: "name",
      },
      {
        id: 1,
        header: t("laboratoryDiagnosticCenterTags", "Tags"),
        key: "tags",
      },
      {
        id: 2,
        header: t("laboratoryDiagnosticCenterChildren", "Child Locations"),
        key: "childLocations",
      },
      {
        id: 3,
        key: "actions",
        header: "Actions",
      },
    ],
    [t]
  );

  const tableRows = useMemo(() => {
    return items?.map((openmrsLocation, index) => ({
      ...openmrsLocation,
      id: openmrsLocation?.uuid,
      name: canEdit ? (
        <EditDiagnosticCenterLinkButton
          locationUuid={openmrsLocation.uuid}
          locationName={openmrsLocation.name}
        />
      ) : (
        openmrsLocation.name
      ),
      tags: openmrsLocation?.tags?.map((p) => p.display)?.join(", ") ?? "",
      childLocations:
        openmrsLocation?.childLocations?.map((p) => p.display)?.join(", ") ??
        "",
      actions: canEdit ? (
        <div
          className={`${styles.clearGhostButtonPadding} ${styles.rowActions}`}
        >
          <EditDiagnosticCenterLinkButton
            showIconOnly={true}
            locationUuid={openmrsLocation.uuid}
            locationName={openmrsLocation.name}
          />
          {(openmrsLocation?.childLocations?.length ?? 0) === 0 && (
            <DeleteDiagnosticCenterActionButton
              locationName={openmrsLocation.name}
              locationUuid={openmrsLocation.uuid}
            />
          )}
        </div>
      ) : (
        ""
      ),
    }));
  }, [items, canEdit]);

  const onLocationTagChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    setLocationTag(evt.target.value);
  };

  if (isLoading && !loaded) {
    // eslint-disable-next-line no-console
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <>
      <TabPanel>
        {t("laboratoryDiagnosticCenterDescription", "Laboratory Sections")}
      </TabPanel>
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
          <TableContainer className={styles.tableContainer}>
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
                {locationTags?.results?.length > 0 && (
                  <Select
                    inline
                    hideLabel={true}
                    labelText=""
                    defaultValue={locationTag}
                    onChange={onLocationTagChange}
                  >
                    {locationTags?.results
                      ?.filter(
                        (p) =>
                          p.display == laboratoryMainLocationTag ||
                          p.display == laboratoryLocationTag
                      )
                      .map((tag) => {
                        return (
                          <SelectItem
                            key={tag.uuid}
                            value={tag.uuid}
                            text={tag.display}
                          />
                        );
                      })}
                  </Select>
                )}

                <TableToolbarMenu>
                  <TableToolbarAction onClick={refresh}>
                    {t("refresh", "Refresh")}
                  </TableToolbarAction>
                </TableToolbarMenu>

                {canEdit && (
                  <>
                    <AddApprovalFlowActionButton />
                  </>
                )}
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
                  <TableHeader></TableHeader>
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
                        "noDiagnosticCentersToDisplay",
                        "No diagnostic centers to display"
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

export default DiagnosticCenterList;
