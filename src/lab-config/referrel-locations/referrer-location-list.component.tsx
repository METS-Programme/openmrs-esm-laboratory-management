import {
  Button,
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
  Tooltip,
} from "@carbon/react";
import { Edit } from "@carbon/react/icons";
import { isDesktop, useSession, userHasAccess } from "@openmrs/esm-framework";
import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ResourceRepresentation } from "../../api/resource-filter-criteria";
import AddReferrerLocationActionButton from "./add-referrer-location-action-button.component";
import FilterReferrerLocations from "./filter-referrer-location.component";
import { useReferrerLocationResource } from "./referrer-location.resource";
import styles from "./referrer-location-list.scss";
import EditReferrerLocationActionsMenu from "./edit-referrer-location-action-button.component";
import { launchOverlay } from "../../components/overlay/hook";
import debounce from "lodash-es/debounce";
import ReferrerLocationForm from "./referrer-location-form.component";
import { TASK_LABMANAGEMENT_TESTCONFIGURATIONS_MUTATE } from "../../config/privileges";

interface ReferrerLocationListProps {
  from?: string;
}

const ReferrerLocationList: React.FC<ReferrerLocationListProps> = () => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const userSession = useSession();
  const [canEdit, setCanEdit] = useState(false);

  useEffect(
    () => {
      setCanEdit(
        userSession?.user &&
          userHasAccess(
            TASK_LABMANAGEMENT_TESTCONFIGURATIONS_MUTATE,
            userSession.user
          )
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const {
    items,
    isLoading,
    totalCount,
    pageSizes,
    isActive,
    isReferrerOut,
    isReferrerIn,
    setActive,
    setReferrerIn,
    setReferrerOut,
    setSearchString,
    isValidating,
    setPageSize,
    currentPageSize,
    loaded,
    pagination: { goTo, results: paginatedItems, currentPage },
  } = useReferrerLocationResource(ResourceRepresentation.Default);

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
        id: 0,
        header: t("laboratoryReferrerLocationName", "Name"),
        key: "name",
      },
      {
        id: 1,
        header: t("laboratoryReferrerLocationPatient", "Patient"),
        key: "patientName",
      },
      {
        id: 2,
        header: t("laboratoryReferrerLocationReferrerIn", "Refer-In"),
        key: "referrerIn",
      },
      {
        id: 3,
        header: t("laboratoryReferrerLocationReferrerOut", "Refer-Out"),
        key: "referrerOut",
      },
      {
        id: 4,
        header: t("laboratoryTestActive", "Active"),
        key: "enabled",
      },
      {
        id: 4,
        header: t("laboratoryReferrerLocationSystem", "System"),
        key: "system",
      },
      {
        id: 6,
        key: "actions",
        header: "Actions",
      },
    ],
    [t]
  );

  const tableRows = useMemo(() => {
    return paginatedItems?.map((referrerLocation, index) => ({
      ...referrerLocation,
      id: referrerLocation?.uuid,
      key: `key-${referrerLocation?.uuid}`,
      uuid: `${referrerLocation?.uuid}`,
      patientName: referrerLocation?.referrerIn
        ? `${referrerLocation?.patientFamilyName ?? ""} ${
            referrerLocation?.patientMiddleName ?? ""
          } ${referrerLocation?.patientGivenName ?? ""}`
        : t("N/A", "N/A"),
      name: canEdit ? (
        <EditReferrerLocationActionsMenu
          data={referrerLocation}
          className={styles.testName}
        />
      ) : (
        `${referrerLocation?.name ?? referrerLocation?.conceptName}
      ${referrerLocation?.acronym ? ` (${referrerLocation.acronym})` : ""}`
      ),
      referrerIn: referrerLocation?.referrerIn
        ? t("yes", "Yes")
        : t("no", "No"),
      referrerOut: referrerLocation?.referrerOut
        ? t("yes", "Yes")
        : t("no", "No"),
      enabled: referrerLocation?.enabled ? t("yes", "Yes") : t("no", "No"),
      system: referrerLocation?.system ? t("yes", "Yes") : t("no", "No"),
      actions: canEdit ? (
        <Tooltip align="bottom" label="Edit Referrer Location">
          <Button
            kind="ghost"
            size="md"
            onClick={() => {
              launchOverlay(
                t(
                  "laboratoryReferrerLocationEditTest",
                  "Edit Referrer Location"
                ),
                <ReferrerLocationForm model={referrerLocation} />
              );
            }}
            iconDescription={t(
              "editReferrerLocation",
              "Edit Referrer Location"
            )}
            renderIcon={(props) => <Edit size={16} {...props} />}
          ></Button>
        </Tooltip>
      ) : (
        <></>
      ),
    }));
  }, [paginatedItems, t, canEdit]);

  if (isLoading && !loaded) {
    // eslint-disable-next-line no-console
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <>
      <TabPanel>
        {t(
          "laboratoryReferrerLocationPanelDescription",
          "Laboratory Reference Locations."
        )}
      </TabPanel>
      <DataTable
        rows={tableRows}
        headers={tableHeaders}
        isSortable={false}
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
                  className={styles.search}
                  persistent
                  value={searchInput}
                  onChange={(e) => handleSearch(e.target.value)}
                />

                <FilterReferrerLocations
                  filterType={isActive}
                  referIn={isReferrerIn}
                  referOut={isReferrerOut}
                  changeFilterType={setActive}
                  changeReferrerIn={setReferrerIn}
                  changeReferrerOut={setReferrerOut}
                />
                {canEdit && (
                  <>
                    <AddReferrerLocationActionButton />
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
                            isSortable: false,
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
                        "noReferrerLocationsToDisplay",
                        "No referrer locations to display"
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
          if (pageSize !== currentPageSize) {
            setPageSize(pageSize);
          }
          if (page !== currentPage) {
            goTo(page);
          }
        }}
        className={styles.paginationOverride}
      />
    </>
  );
};

export default ReferrerLocationList;
