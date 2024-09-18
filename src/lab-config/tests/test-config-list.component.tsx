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
  InlineLoading,
} from "@carbon/react";
import { Edit } from "@carbon/react/icons";
import {
  isDesktop,
  usePagination,
  useSession,
  userHasAccess,
} from "@openmrs/esm-framework";
import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ResourceRepresentation } from "../../api/resource-filter-criteria";
import AddTestConfigActionButton from "./add-test-config-action-button.component";
import FilterTestConfigs from "./filter-test-config.component";
import { useTestConfigResource } from "./test-config.resource";
import styles from "./test-config-list.scss";
import AddTestConfigImportActionButton from "./add-test-config-import-action-button.component";
import EditTestConfigActionsMenu from "./edit-test-config-action-button.component";
import { launchOverlay } from "../../components/overlay/hook";
import debounce from "lodash-es/debounce";
import TestConfigForm from "./test-config-form.component";
import { TASK_LABMANAGEMENT_TESTCONFIGURATIONS_MUTATE } from "../../config/privileges";

interface TestConfigListProps {
  from?: string;
}

const TestConfigList: React.FC<TestConfigListProps> = () => {
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
    setActive,
    setSearchString,
    isValidating,
    setPageSize,
    currentPageSize,
    loaded,
    pagination: { goTo, results: paginatedItems, currentPage },
  } = useTestConfigResource(ResourceRepresentation.Default);

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
        header: t("laboratoryTestName", "Test Name"),
        key: "testName",
      },
      {
        id: 1,
        header: t("laboratoryTestGroup", "Group"),
        key: "testGroupName",
      },
      {
        id: 2,
        header: t("laboratoryTestRequireApproval", "Requires Approval"),
        key: "requireApproval",
      },
      {
        id: 3,
        header: t("laboratoryTestApprovalFlow", "Approval Flow"),
        key: "approvalFlowName",
      },
      {
        id: 4,
        header: t("laboratoryTestActive", "Active"),
        key: "enabled",
      },
      {
        id: 5,
        key: "actions",
        header: "Actions",
      },
    ],
    [t]
  );

  const tableRows = useMemo(() => {
    return paginatedItems?.map((testConfig, index) => ({
      ...testConfig,
      id: testConfig?.uuid,
      key: `key-${testConfig?.uuid}`,
      uuid: `${testConfig?.uuid}`,
      testGroupName: testConfig?.testGroupName,
      testName: (
        <EditTestConfigActionsMenu
          data={testConfig}
          className={styles.testName}
        />
      ),
      requireApproval: testConfig?.requireApproval
        ? t("yes", "Yes")
        : t("no", "No"),
      approvalFlowName: testConfig?.approvalFlowName ?? "N/A",
      enabled: testConfig?.enabled ? t("yes", "Yes") : t("no", "No"),
      actions: canEdit ? (
        <Tooltip align="bottom" label="Edit Test Configuration">
          <Button
            kind="ghost"
            size="md"
            onClick={() => {
              launchOverlay(
                t("laboratoryTestConfigEditTest", "Edit Test Configuration"),
                <TestConfigForm model={testConfig} />
              );
            }}
            iconDescription={t("editTestConfig", "Edit Test Configuration")}
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
          "laboratoryTestConfigPanelDescription",
          "Laboratory Tests Configuration."
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
                  persistent
                  value={searchInput}
                  onChange={(e) => handleSearch(e.target.value)}
                />

                <FilterTestConfigs
                  filterType={isActive}
                  changeFilterType={setActive}
                />
                {canEdit && (
                  <>
                    <AddTestConfigImportActionButton />
                    <AddTestConfigActionButton />
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
                        "noTestConfigsToDisplay",
                        "No test configurations to display"
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

export default TestConfigList;
