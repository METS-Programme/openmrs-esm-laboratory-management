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
  TableBatchAction,
  TableExpandHeader,
  TableExpandRow,
  TableSelectAll,
  TableExpandedRow,
  ProgressBar,
} from "@carbon/react";
import { CheckmarkOutline, MisuseOutline } from "@carbon/react/icons";
import {
  formatDate,
  isDesktop,
  parseDate,
  showModal,
  useSession,
  userHasAccess,
} from "@openmrs/esm-framework";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ResourceRepresentation } from "../api/resource-filter-criteria";
import debounce from "lodash-es/debounce";
import { TASK_LABMANAGEMENT_TESTRESULTS_APPROVE } from "../config/privileges";
import {
  applyTestRequestAction,
  TestRequestSelection,
  useTestRequestResource,
} from "../api/test-request.resource";
import styles from "../tests-ordered/laboratory-queue.scss";
import {
  TestRequestItemMatchNoResults,
  TestRequestItemMatchNoWorkStarted,
  TestRequestItemMatchWorksheetNoResults,
  TestRequestItemStatusInProgress,
  TestRequestItemStatusReferredOutLab,
} from "../api/types/test-request-item";
import { useOrderDate } from "../hooks/useOrderDate";
import { formatTestName } from "../components/test-name";
import TestRequestItemList from "./test-result-item-list.component";
import TableSelectRow from "../components/carbon/TableSelectRow";
import {
  ApprovalActionApproved,
  ApprovalActionRejected,
} from "../api/types/approval-action";
import { handleMutate } from "../api/swr-revalidation";
import { URL_API_TEST_REQUEST } from "../config/urls";
import FilterLaboratoryTests from "../tests-ordered/filter-laboratory-tests.component";
import TestRequestInfo from "../components/test-request/text-request-info.component";
import { TestResultActionTypeResultApprove } from "../api/types/test-request";
import PrintTestRequestButton from "../print/print-test-request-action-button.component";
import EntityName from "../components/test-request/entity-name";

interface ResultsClearanceListProps {
  from?: string;
}

const ResultsClearanceList: React.FC<ResultsClearanceListProps> = () => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const userSession = useSession();
  const [canApproveTestResults, setCanApproveTestResults] = useState(false);
  const { currentOrdersDate } = useOrderDate();
  const [selectedItems, setSelectedItems] = useState<TestRequestSelection>({});
  const [expandedItems, setExpandedItems] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(
    () => {
      setCanApproveTestResults(
        userSession?.user &&
          userHasAccess(
            TASK_LABMANAGEMENT_TESTRESULTS_APPROVE,
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
    setSearchString,
    isValidating,
    loaded,
    setMinActivatedDate,
    minActivatedDate,
    setMaxActivatedDate,
    maxActivatedDate,
    testConcept,
    setTestConcept,
    itemLocation,
    setItemLocation,
    allTests,
    setAllTests,
    itemMatch,
    setItemMatch,
  } = useTestRequestResource({
    v: ResourceRepresentation.Full,
    itemStatus: `${TestRequestItemStatusReferredOutLab},${TestRequestItemStatusInProgress}`,
    minActivatedDate: currentOrdersDate,
    testConceptTests: false,
    approvals: true,
    allTests: false,
    approvalPerm: true,
    includeTestItemTestResult: true,
    testResultApprovals: true,
    includeItemConcept: true,
    worksheetInfo: true,
  });

  const debouncedSearch = useMemo(
    () => debounce((searchTerm) => setSearchString(searchTerm), 300),
    [setSearchString]
  );

  useEffect(() => {
    if (minActivatedDate !== currentOrdersDate) {
      setMinActivatedDate(currentOrdersDate);
    }
  }, [currentOrdersDate, minActivatedDate, setMinActivatedDate]);

  const handleSearch = (query: string) => {
    setSearchInput(query);
    debouncedSearch(query);
  };

  const tableHeaders = [
    { id: 0, header: t("date", "Date"), key: "date" },
    {
      id: 1,
      header: t("laboratoryRequestNumber", "Request Number"),
      key: "requestNumber",
    },
    { id: 2, header: t("laboratoryRequestEntity", "Entity"), key: "patient" },
    { id: 3, header: t("Identification", "Identification"), key: "identifier" },
    { id: 5, header: t("orderer", "Ordered By"), key: "orderer" },
    { id: 6, header: t("urgency", "Urgency"), key: "urgency" },
    { id: 7, header: "", key: "actions" },
    { id: 8, header: "detailsTests", key: "detailsTests" },
    { id: 8, header: "detailsTests", key: "detailsInfo" },
  ];

  const testTableHeaders = [
    {
      id: 0,
      header: t("labSection", "Lab Section"),
      key: "toLocationName",
    },
    {
      id: 1,
      header: t("laboratoryTest", "Test"),
      key: "testName",
    },
    { id: 2, header: t("order#", "Order#"), key: "orderNumber" },
    {
      id: 3,
      header: t("laboratoryTestSamplesCollected", "Samples"),
      key: "samples",
    },
    {
      id: 4,
      header: t("status", "Status"),
      key: "status",
    },
    {
      id: 5,
      header: t("waitTime", "Wait Time"),
      key: "waitTime",
    },
    { id: 5, header: "details", key: "details" },
  ];

  const tableRows = useMemo(() => {
    return items?.map((entry, index) => ({
      id: entry?.uuid,
      dateCreated: entry.dateCreated,
      date: (
        <span className={styles["single-line-display"]}>
          {formatDate(parseDate(entry?.dateCreated as any as string))}
        </span>
      ),
      patient: <EntityName testRequest={entry} />,
      identifier: entry?.referralInExternalRef ?? entry?.patientIdentifier,
      requestNumber: entry?.requestNo,
      orderer: `${entry?.providerFamilyName ?? ""} ${
        entry?.providerMiddleName ?? ""
      } ${entry?.providerGivenName ?? ""}`,
      urgency: entry?.urgency,
      actions: (
        <PrintTestRequestButton
          testRequestUuid={entry.uuid}
          enableResults={true}
        />
      ),
      detailsInfo: <TestRequestInfo testRequest={entry} />,
      detailsTests: entry?.tests ?? [],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const cancelSelectedRows = () => {
    setSelectedItems({});
  };

  const refreshTestItems = () => {
    handleMutate(URL_API_TEST_REQUEST);
  };

  const getSelectedItemsDescription = () => {
    return items
      .filter(
        (p) =>
          selectedItems[p.uuid] &&
          Object.keys(selectedItems[p.uuid]?.tests).length > 0
      )
      .sort(
        (x, y) =>
          Object.keys(selectedItems[y.uuid]?.tests).length -
          Object.keys(selectedItems[x.uuid]?.tests).length
      )
      .map((entry) => (
        <div className="laboratory-test-request-approve-item">
          <p>
            {entry.requestNo}:{" "}
            {entry.referralFromFacilityName
              ? entry.referralFromFacilityName
              : `${entry.patientFamilyName}{" "}
              ${entry.patientMiddleName} ${entry.patientGivenName}`}
          </p>
          <ul>
            {entry.tests
              ?.filter((x) => selectedItems[entry.uuid]?.tests?.[x.uuid])
              ?.map((test) => (
                <li>
                  {test.orderNumber} -{" "}
                  {formatTestName(test.testName, test.testShortName)}
                </li>
              ))}
          </ul>
        </div>
      ));
  };

  const onApproveConfirmation = useCallback(
    (remarks: string) => {
      return applyTestRequestAction({
        actionType: TestResultActionTypeResultApprove,
        action: ApprovalActionApproved,
        remarks: remarks,
        records: items
          .filter(
            (p) =>
              selectedItems[p.uuid]?.tests &&
              Object.keys(selectedItems[p.uuid].tests).length > 0
          )
          .map((p) =>
            p.tests
              .filter((x) => selectedItems[p.uuid].tests[x.uuid])
              .map((x) => x.testResult?.uuid)
          )
          .flatMap((p) => p)
          .filter((x) => x != null),
      });
    },
    [items, selectedItems]
  );

  const onRejectionConfirmation = useCallback(
    (remarks: string) => {
      return applyTestRequestAction({
        actionType: TestResultActionTypeResultApprove,
        action: ApprovalActionRejected,
        remarks: remarks,
        records: items
          .filter(
            (p) =>
              selectedItems[p.uuid]?.tests &&
              Object.keys(selectedItems[p.uuid].tests).length > 0
          )
          .map((p) =>
            p.tests
              .filter((x) => selectedItems[p.uuid].tests[x.uuid])
              .map((x) => x.testResult?.uuid)
          )
          .flatMap((p) => p)
          .filter((x) => x != null),
      });
    },
    [items, selectedItems]
  );

  const handleRejectTestResults = useCallback(() => {
    const dispose = showModal("lab-approve-test-request-dialog", {
      closeModal: (success: boolean) => {
        if (success) {
          cancelSelectedRows();
          refreshTestItems();
        }
        dispose();
      },
      approvalTitle: t("laboratoryTestRejectResults", "Reject Results"),
      approvalDescription: getSelectedItemsDescription(),
      remarksTextLabel: t(
        "laboratoryApproveRejectReason",
        "Reason for rejection"
      ),
      actionButtonLabel: t("reject", "Reject"),
      remarksRequired: true,
      approveCallback: onRejectionConfirmation,
      kind: "danger",
      successMessageTitle: t(
        "laboratoryTestResultRejectTests",
        "Reject Results"
      ),
      successMessageBody: t(
        "laboratoryTestResultRejectTestsSuccess",
        "Results rejected successfully"
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSelectedItemsDescription, onRejectionConfirmation]);

  const handleApprovalTestRequests = useCallback(() => {
    const dispose = showModal("lab-approve-test-request-dialog", {
      closeModal: (success: boolean) => {
        if (success) {
          cancelSelectedRows();
          refreshTestItems();
        }
        dispose();
      },
      approvalTitle: t("laboratoryTestResultApprovedTests", "Approve Results"),
      approvalDescription: getSelectedItemsDescription(),
      remarksTextLabel: t("laboratoryApproveRemarks", "Remarks (optional)"),
      actionButtonLabel: t("approve", "Approve"),
      remarksRequired: false,
      approveCallback: onApproveConfirmation,
      kind: "primary",
      successMessageTitle: t(
        "laboratoryTestResultApprovedTests",
        "Approve Results"
      ),
      successMessageBody: t(
        "laboratoryTestResultApprovedTestsSuccess",
        "Results approved successfully"
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSelectedItemsDescription, onApproveConfirmation]);

  if (isLoading && !loaded) {
    // eslint-disable-next-line no-console
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <>
      {(isLoading || isValidating) && loaded && (
        <ProgressBar
          size="small"
          type="indented"
          status="status"
          label=""
          hideLabel={true}
          className={styles.progressBarThin}
        />
      )}
      <DataTable
        rows={tableRows}
        headers={tableHeaders}
        isSortable
        useZebraStyles
        overflowMenuOnHover={true}
        render={({
          rows,
          headers,
          getHeaderProps,
          getTableProps,
          getRowProps,
          getBatchActionProps,
          getSelectionProps,
          getToolbarProps,
          selectedRows,
          expandRow,
        }) => {
          const onTestRequestSelectionChange = (
            evt: React.ChangeEvent<HTMLInputElement>,
            data: { checked: boolean; id: string },
            testRequestId: string
          ) => {
            const newSelectedItems = { ...selectedItems };
            if (!newSelectedItems[testRequestId]) {
              newSelectedItems[testRequestId] = { tests: {}, allTests: false };
            }
            if (data.checked) {
              newSelectedItems[testRequestId].allTests = true;
              newSelectedItems[testRequestId].tests = items
                ?.find((p) => p.uuid == testRequestId)
                ?.tests?.reduce((x, y) => {
                  if (y?.testResult?.permission?.canApprove) {
                    x[y.uuid] = true;
                  }
                  return x;
                }, {} as { [key: string]: boolean });
            } else {
              newSelectedItems[testRequestId].allTests = false;
              delete newSelectedItems[testRequestId]["tests"];
              newSelectedItems[testRequestId]["tests"] = {};
            }
            setSelectedItems(newSelectedItems);
          };

          const onAllSelectionChange = (
            evt: React.ChangeEvent<HTMLInputElement>
          ) => {
            let value = evt.target.checked;
            let newSelectedItems = {};
            if (value) {
              items.reduce((accum, item) => {
                accum[item.uuid] = {
                  allTests: true,
                  tests: {},
                };
                accum[item.uuid].tests = item.tests?.reduce(
                  (accumTest, test) => {
                    if (test?.testResult?.permission?.canApprove) {
                      accumTest[test.uuid] = true;
                    }
                    return accumTest;
                  },
                  accum[item.uuid].tests
                );
                return accum;
              }, newSelectedItems);
            }
            setSelectedItems(newSelectedItems);
          };

          const selectedCount = Object.entries(selectedItems).reduce(
            (accum, [k, v]) => {
              accum["allCount"] = accum["allCount"] + (v.allTests ? 1 : 0);
              let testCount = Object.keys(v.tests).length;
              accum["testsCount"] = accum["testsCount"] + testCount;
              accum["someCount"] =
                accum["someCount"] + (v.allTests || testCount > 0 ? 1 : 0);
              return accum;
            },
            { allCount: 0, someCount: 0, testsCount: 0 }
          );

          const batchActionProps = {
            ...getBatchActionProps({
              shouldShowBatchActions:
                selectedCount.someCount > 0 || selectedCount.allCount > 0,
              totalCount: items.length,
              totalSelected: selectedCount.someCount,
              translateWithId: (
                id,
                { totalSelected, totalCount } = {
                  totalSelected: 0,
                  totalCount: 0,
                }
              ) => {
                if (id === "carbon.table.batch.cancel") {
                  return t("cancel", "Cancel");
                }
                if (id === "carbon.table.batch.selectAll") {
                  return `${t("selectAll", "Select all")} (${items.length})`;
                }
                return `${selectedCount.someCount} ${t(
                  "requests(s)",
                  "requests(s)"
                )} ${selectedCount.testsCount} ${t("test(s)", "test(s)")} ${t(
                  "selected",
                  "Selected"
                )}`;
              },
              style: {
                display:
                  selectedCount.someCount > 0 || selectedCount.allCount > 0
                    ? ""
                    : "none",
              },
            }),
            ...{
              shouldShowBatchActions:
                selectedCount.someCount > 0 || selectedCount.allCount > 0,
              totalCount: items.length,
              totalSelected: selectedCount.someCount,
              onCancel: cancelSelectedRows,
            },
          };

          const anyCanApprove = items.some((p) =>
            p?.tests?.some((y) => y.testResult?.permission?.canApprove)
          );

          const onExpandRow = (e: MouseEvent, rowId: string) => {
            expandedItems[rowId] = Boolean(!expandedItems[rowId]);
            expandRow(rowId);
          };

          return (
            <TableContainer className={styles.tableContainer}>
              <TableToolbar
                {...getToolbarProps()}
                style={{
                  position:
                    selectedCount.someCount > 0 || selectedCount.allCount > 0
                      ? "inherit"
                      : "static",
                  margin: 0,
                }}
              >
                <TableBatchActions {...batchActionProps}>
                  {canApproveTestResults && (
                    <>
                      <TableBatchAction
                        renderIcon={CheckmarkOutline}
                        iconDescription={t(
                          "LaboratoryApproveTestResult",
                          "Approve Result(s)"
                        )}
                        onClick={handleApprovalTestRequests}
                      >
                        {t("laboratoryApproveTestResult", "Approve Result(s)")}
                      </TableBatchAction>
                      <TableBatchAction
                        kind="danger"
                        renderIcon={MisuseOutline}
                        iconDescription={t(
                          "LaboratoryRejectResults",
                          "Reject Results(s)"
                        )}
                        onClick={handleRejectTestResults}
                      >
                        {t("LaboratoryRejectResults", "Reject Results(s)")}
                      </TableBatchAction>
                    </>
                  )}
                </TableBatchActions>
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
                  <FilterLaboratoryTests
                    maxActivatedDate={maxActivatedDate}
                    minActivatedDate={minActivatedDate}
                    diagnosticCenterUuid={itemLocation}
                    onMaxActivatedDateChanged={setMaxActivatedDate}
                    onDiagnosticCenterChanged={setItemLocation}
                    onTestChanged={setTestConcept}
                    enableFocus={true}
                    focus={allTests}
                    onFocusChanged={setAllTests}
                    enableItemMatch={true}
                    onItemMatchChanged={setItemMatch}
                    itemMatch={itemMatch}
                    excluteItemMatchOptions={[
                      TestRequestItemMatchNoResults,
                      TestRequestItemMatchNoWorkStarted,
                      TestRequestItemMatchWorksheetNoResults,
                    ]}
                  />
                </TableToolbarContent>
              </TableToolbar>
              <Table
                {...getTableProps()}
                className={styles.activePatientsTable}
              >
                <TableHead>
                  <TableRow>
                    <TableExpandHeader />
                    {anyCanApprove && (
                      <TableSelectAll
                        {...getSelectionProps({
                          onClick: onAllSelectionChange,
                        })}
                        checked={
                          items.length > 0 &&
                          selectedCount.allCount == items.length
                        }
                        indeterminate={
                          selectedCount.allCount != items.length &&
                          selectedCount.someCount > 0
                        }
                      />
                    )}
                    {headers.map(
                      (header) =>
                        !header.key.startsWith("details") && (
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
                    <TableHeader></TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => {
                    const testRequest = items?.find((p) => p.uuid == row.id);
                    return (
                      <React.Fragment key={row.id}>
                        <TableExpandRow
                          className={
                            isDesktop ? styles.desktopRow : styles.tabletRow
                          }
                          {...getRowProps({ row })}
                          isExpanded={Boolean(expandedItems[row.id])}
                          onExpand={(e) => onExpandRow(e, row.id)}
                          key={row.id}
                        >
                          {anyCanApprove &&
                          items
                            .find((x) => x.uuid == row.id)
                            ?.tests?.some(
                              (p) => p?.testResult?.permission?.canApprove
                            ) ? (
                            <TableSelectRow
                              {...getSelectionProps({
                                row,
                              })}
                              checked={Boolean(selectedItems[row.id]?.allTests)}
                              indeterminate={Boolean(
                                !selectedItems[row.id]?.allTests &&
                                  selectedItems[row.id]?.tests &&
                                  Object.keys(selectedItems[row.id]?.tests)
                                    .length > 0
                              )}
                              onChange={(e, v) =>
                                onTestRequestSelectionChange(e, v, row.id)
                              }
                            />
                          ) : (
                            anyCanApprove && <TableCell></TableCell>
                          )}
                          {row.cells.map(
                            (cell) =>
                              !cell?.info?.header.startsWith("details") && (
                                <TableCell key={cell.id}>
                                  {cell.value}
                                </TableCell>
                              )
                          )}
                        </TableExpandRow>
                        <TableExpandedRow
                          className={styles.tableExpandedRow}
                          colSpan={headers.length + 1}
                        >
                          {expandedItems[row.id] && (
                            <section
                              className={`${styles.rowExpandedContent} ${styles.worksheetItems}`}
                            >
                              <TestRequestItemList
                                tests={row.cells[row.cells.length - 2].value}
                                tableHeaders={testTableHeaders}
                                onSelectionChange={setSelectedItems}
                                selectedItems={selectedItems}
                                testRequestId={row.id}
                                enableSelection={true}
                                testRequest={testRequest}
                              />
                              {row.cells[row.cells.length - 1].value}
                            </section>
                          )}
                        </TableExpandedRow>
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
                          "noPendingApprovalsToDisplay",
                          "No pending approvals to display"
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

export default ResultsClearanceList;
