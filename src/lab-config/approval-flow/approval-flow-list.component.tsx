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
import AddApprovalFlowActionButton from "./add-approval-flow-action-button.component";

import { useApprovalFlowResource } from "./approval-flow.resource";
import styles from "./approval-flow-list.scss";
import EditApprovalFlowActionsMenu from "./edit-approval-flow-action-button.component";
import { launchOverlay } from "../../components/overlay/hook";
import debounce from "lodash-es/debounce";
import ApprovalFlowForm from "./approval-flow-form.component";
import { TASK_LABMANAGEMENT_APPROVALCONFIGURATIONS_MUTATE } from "../../config/privileges";

interface ApprovalFlowListProps {
  from?: string;
}

const ApprovalFlowList: React.FC<ApprovalFlowListProps> = () => {
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
  } = useApprovalFlowResource(ResourceRepresentation.Default);

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
        header: t("laboratoryApprovalFlowName", "Name"),
        key: "name",
      },
      {
        id: 1,
        header: t("laboratoryApprovalFlowSystemName", "System Name"),
        key: "systemName",
      },
      {
        id: 2,
        header: t("laboratoryApprovalFlowLevelOne", "Level One"),
        key: "levelOneApprovalTitle",
      },
      {
        id: 3,
        header: t("laboratoryApprovalFlowLevelTwo", "Level Two"),
        key: "levelTwoApprovalTitle",
      },
      {
        id: 4,
        header: t("laboratoryApprovalFlowLevelThree", "Level Three"),
        key: "levelThreeApprovalTitle",
      },
      {
        id: 5,
        header: t("laboratoryApprovalFlowLevelFour", "Level Four"),
        key: "levelFourApprovalTitle",
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
    return items?.map((approvalFlow, index) => ({
      ...approvalFlow,
      id: approvalFlow?.uuid,
      key: `key-${approvalFlow?.uuid}`,
      uuid: `${approvalFlow?.uuid}`,
      name: canEdit ? (
        <EditApprovalFlowActionsMenu
          data={approvalFlow}
          className={styles.approvalFlowName}
        />
      ) : (
        approvalFlow.name
      ),
      systemName: approvalFlow?.systemName,
      levelOneApprovalTitle: (
        <div className={styles.approvalLevel}>
          <span>{approvalFlow?.levelOneApprovalTitle}</span>
          <span
            className={
              approvalFlow?.levelOneAllowOwner
                ? styles.approvalAllow
                : styles.approvalCrossOut
            }
          >
            {t("laboratoryApprovalFlowAllowOwner", "Owner Can Approve")}
          </span>
        </div>
      ),
      levelTwoApprovalTitle: approvalFlow?.levelTwoUuid ? (
        <div className={styles.approvalLevel}>
          <span>{approvalFlow?.levelTwoApprovalTitle}</span>
          <span
            className={
              approvalFlow?.levelTwoAllowOwner
                ? styles.approvalAllow
                : styles.approvalCrossOut
            }
          >
            {t("laboratoryApprovalFlowAllowOwner", "Owner Can Approve")}
          </span>
          <span
            className={
              approvalFlow?.levelTwoAllowPrevious
                ? styles.approvalAllow
                : styles.approvalCrossOut
            }
          >
            {t(
              "laboratoryApprovalFlowAllowPrevious",
              "Previous Approver Can Approve"
            )}
          </span>
        </div>
      ) : (
        t("NA", "N/A")
      ),
      levelThreeApprovalTitle: approvalFlow?.levelThreeUuid ? (
        <div className={styles.approvalLevel}>
          <span>{approvalFlow?.levelThreeApprovalTitle}</span>
          <span
            className={
              approvalFlow?.levelThreeAllowOwner
                ? styles.approvalAllow
                : styles.approvalCrossOut
            }
          >
            {t("laboratoryApprovalFlowAllowOwner", "Owner Can Approve")}
          </span>
          <span
            className={
              approvalFlow?.levelThreeAllowPrevious
                ? styles.approvalAllow
                : styles.approvalCrossOut
            }
          >
            {t(
              "laboratoryApprovalFlowAllowPrevious",
              "Previous Approver Can Approve"
            )}
          </span>
        </div>
      ) : (
        t("NA", "N/A")
      ),
      levelFourApprovalTitle: approvalFlow?.levelFourUuid ? (
        <div className={styles.approvalLevel}>
          <span>{approvalFlow?.levelFourApprovalTitle}</span>
          <span
            className={
              approvalFlow?.levelFourAllowOwner
                ? styles.approvalAllow
                : styles.approvalCrossOut
            }
          >
            {t("laboratoryApprovalFlowAllowOwner", "Owner Can Approve")}
          </span>
          <span
            className={
              approvalFlow?.levelFourAllowPrevious
                ? styles.approvalAllow
                : styles.approvalCrossOut
            }
          >
            {t(
              "laboratoryApprovalFlowAllowPrevious",
              "Previous Approver Can Approve"
            )}
          </span>
        </div>
      ) : (
        t("NA", "N/A")
      ),
      actions: canEdit ? (
        <Tooltip align="bottom" label="Edit Approval Flow">
          <Button
            kind="ghost"
            size="md"
            onClick={() => {
              launchOverlay(
                t("laboratoryApprovalFlowEditTest", "Edit Approval Flow"),
                <ApprovalFlowForm model={approvalFlow} />
              );
            }}
            iconDescription={t("editApprovalFlow", "Edit Approval Flow")}
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
        {t(
          "laboratoryApprovalFlowPanelDescription",
          "Laboratory Approval Flows"
        )}
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
                        "noApprovalFlowsToDisplay",
                        "No approval flows to display"
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

export default ApprovalFlowList;
