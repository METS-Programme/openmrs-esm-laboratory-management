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
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  Select,
  SelectItem,
} from "@carbon/react";
import { Edit } from "@carbon/react/icons";
import {
  isDesktop,
  useLocations,
  useSession,
  userHasAccess,
} from "@openmrs/esm-framework";
import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ResourceRepresentation } from "../../api/resource-filter-criteria";
import AddStorageActionButton from "./add-storage-action-button.component";

import { useStorageResource } from "./storage.resource";
import styles from "../../tests-ordered/laboratory-queue.scss";
import EditStorageActionsMenu from "./edit-storage-action-button.component";
import { launchOverlay } from "../../components/overlay/hook";
import debounce from "lodash-es/debounce";
import StorageForm from "./storage-form.component";
import { TASK_LABMANAGEMENT_STORAGE_MUTATE } from "../../config/privileges";
import StorageUnitList from "./storage-units-list.component";
import { useLaboratoryConfig } from "../../hooks/useLaboratoryConfig";
import DeleteStorageActionButton from "./delete-storage-action-button.component";

interface StorageListProps {
  from?: string;
}

const StorageList: React.FC<StorageListProps> = () => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const userSession = useSession();
  const [canEdit, setCanEdit] = useState(false);
  const {
    laboratoryConfig: { laboratoryLocationTag },
  } = useLaboratoryConfig();
  const locations = useLocations(laboratoryLocationTag);

  useEffect(
    () => {
      setCanEdit(
        userSession?.user &&
          userHasAccess(TASK_LABMANAGEMENT_STORAGE_MUTATE, userSession.user)
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
    isActive,
    setActive,
    setSearchString,
    isValidating,
    loaded,
    setAtLocation,
    atLocation,
  } = useStorageResource(ResourceRepresentation.Default);

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
        header: t("laboratoryStorageLabSection", "Lab Section"),
        key: "atLocation",
      },
      {
        id: 1,
        header: t("laboratoryStorageName", "Name"),
        key: "name",
      },
      {
        id: 1,
        header: t("laboratoryStorageDescription", "Description"),
        key: "description",
      },
      {
        id: 2,
        header: t("laboratoryStorageCapacity", "Capacity"),
        key: "capacity",
      },
      {
        id: 3,
        header: t("laboratoryStorageActive", "Active"),
        key: "active",
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
    return items?.map((storage, index) => ({
      id: storage?.uuid,
      key: `key-${storage?.uuid}`,
      uuid: `${storage?.uuid}`,
      name: canEdit ? (
        <EditStorageActionsMenu data={storage} className={styles.storageName} />
      ) : (
        storage.name
      ),
      description: storage?.description,
      atLocation: storage?.atLocationName,
      capacity: storage?.capacity,
      active: storage?.active ? t("yes", "Yes") : t("no", "No"),
      actions: canEdit ? (
        <div
          className={`${styles.clearGhostButtonPadding} ${styles.rowActions}`}
        >
          <Button
            kind="ghost"
            size="md"
            onClick={() => {
              launchOverlay(
                t("laboratoryStorageEditTest", "Edit Storage"),
                <StorageForm model={storage} />
              );
            }}
            iconDescription={t("editStorage", "Edit Storage")}
            renderIcon={(props) => <Edit size={16} {...props} />}
          ></Button>

          <DeleteStorageActionButton
            storageName={storage.name}
            storageUuid={storage.uuid}
          />
        </div>
      ) : (
        ""
      ),
    }));
  }, [items, t, canEdit]);

  if (isLoading && !loaded) {
    // eslint-disable-next-line no-console
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <>
      <TabPanel>
        {t("laboratoryStoragePanelDescription", "Laboratory Storage")}
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

                <Select
                  className={styles.select}
                  style={{ width: "20rem" }}
                  type="text"
                  labelText={""}
                  onChange={(e) => setAtLocation(e.target.value)}
                  value={atLocation}
                >
                  <SelectItem
                    text={t("laboratoryAllLabSections", "All Lab Sections")}
                    value=""
                  />
                  {locations &&
                    locations.map((location) => (
                      <SelectItem
                        title={location.display}
                        key={location.uuid}
                        text={location.display}
                        value={location.uuid}
                      >
                        {location.display}
                      </SelectItem>
                    ))}
                </Select>

                {canEdit && (
                  <>
                    <AddStorageActionButton />
                  </>
                )}
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  <TableExpandHeader />
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
                      <TableExpandRow
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
                      </TableExpandRow>
                      {row.isExpanded && (
                        <TableExpandedRow
                          className={styles.tableExpandedRow}
                          colSpan={headers.length + 1}
                        >
                          <section className={styles.rowExpandedContent}>
                            <StorageUnitList storageUuid={row.id} />
                          </section>
                        </TableExpandedRow>
                      )}
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
                      {t("noStoragesToDisplay", "No storage to display")}
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

export default StorageList;
