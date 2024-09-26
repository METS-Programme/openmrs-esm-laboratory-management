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
import AddApprovalConfigActionButton from "./add-approval-config-action-button.component";

import { useApprovalConfigResource } from "./approval-config.resource";
import styles from "./approval-config-list.scss";
import EditApprovalConfigActionsMenu from "./edit-approval-config-action-button.component";
import { launchOverlay } from "../../components/overlay/hook";
import debounce from "lodash-es/debounce";
import ApprovalConfigForm from "./approval-config-form.component";
import { TASK_LABMANAGEMENT_APPROVALCONFIGURATIONS_MUTATE } from "../../config/privileges";

interface ApprovalConfigListProps {
  from?: string;
}

const ApprovalConfigList: React.FC<ApprovalConfigListProps> = () => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const userSession = useSession();
  const [canEdit, setCanEdit] = useState(false);

  useEffect(
    () => {
      setCanEdit(
        userSession?.user &&
          userHasAccess(
            TASK_LABMANAGEMENT_APPROVALCONFIGURATIONS_MUTATE,
            userSession.user
          )
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
  } = useApprovalConfigResource(ResourceRepresentation.Default);

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
        header: t("laboratoryApprovalConfigTitle", "Approval Title"),
        key: "approvalTitle",
      },
      {
        id: 1,
        header: t("laboratoryApprovalConfigPrivilege", "Privilege"),
        key: "privilege",
      },
      {
        id: 2,
        header: t("laboratoryApprovalConfigPendingStatus", "Pending Status"),
        key: "pendingStatus",
      },
      {
        id: 3,
        header: t("laboratoryApprovalConfigReturnedStatus", "Returned Status"),
        key: "returnedStatus",
      },
      {
        id: 4,
        header: t("laboratoryApprovalConfigRejectedStatus", "Rejected Status"),
        key: "rejectedStatus",
      },
      {
        id: 5,
        header: t("laboratoryApprovalConfigApprovedStatus", "Approved Status"),
        key: "approvedStatus",
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
    return items?.map((approvalConfig, index) => ({
      ...approvalConfig,
      id: approvalConfig?.uuid,
      key: `key-${approvalConfig?.uuid}`,
      uuid: `${approvalConfig?.uuid}`,
      approvalTitle: canEdit ? (
        <EditApprovalConfigActionsMenu
          data={approvalConfig}
          className={styles.approvalConfigName}
        />
      ) : (
        approvalConfig.approvalTitle
      ),
      privilege: approvalConfig?.privilege,
      pendingStatus: approvalConfig?.pendingStatus,
      returnedStatus: approvalConfig?.returnedStatus,
      rejectedStatus: approvalConfig?.rejectedStatus,
      approvedStatus: approvalConfig?.approvedStatus,
      actions: canEdit ? (
        <Tooltip align="bottom" label="Edit Approval">
          <Button
            kind="ghost"
            size="md"
            onClick={() => {
              launchOverlay(
                t("laboratoryApprovalConfigEditTest", "Edit Approval"),
                <ApprovalConfigForm model={approvalConfig} />
              );
            }}
            iconDescription={t("editApprovalConfig", "Edit Approval")}
            renderIcon={(props) => <Edit size={16} {...props} />}
          ></Button>
        </Tooltip>
      ) : (
        <></>
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
        {t("laboratoryApprovalConfigPanelDescription", "Laboratory Approvals")}
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

                {canEdit && (
                  <>
                    <AddApprovalConfigActionButton />
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
                        "noApprovalConfigsToDisplay",
                        "No approval configs to display"
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

export default ApprovalConfigList;
