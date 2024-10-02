import {
  DataTable,
  DataTableSkeleton,
  Pagination,
  Table,
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
  ProgressBar,
  Tag,
} from "@carbon/react";
import {
  formatDate,
  isDesktop,
  navigate,
  parseDate,
} from "@openmrs/esm-framework";
import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ResourceRepresentation } from "../api/resource-filter-criteria";
import debounce from "lodash-es/debounce";
import {
  TestRequestSelection,
  useTestRequestResource,
} from "../api/test-request.resource";
import styles from "../tests-ordered/laboratory-queue.scss";
import {
  getDescriptiveStatus,
  TestRequestItemStatusCancelled,
  TestRequestItemStatusCompleted,
} from "../api/types/test-request-item";
import { useOrderDate } from "../hooks/useOrderDate";
import { formatTestName } from "../components/test-name";
import { URL_LAB_WORKSHEET_VIEW_ABS } from "../config/urls";
import FilterLaboratoryTests from "../tests-ordered/filter-laboratory-tests.component";
import TestRequestInfo from "../components/test-request/text-request-info.component";
import TestRequestSampleList from "../tests-ordered/test-request-sample-list.component";
import { SampleReferenceDisplay } from "../components/sample-reference-display";
import TestRequestCompletedItemList from "./test-request-completed-item-list.component";
import EditTestResultButton from "../work-list/edit-test-result-action-button.component";
import PrintTestRequestButton from "../print/print-test-request-action-button.component";
import EntityName, {
  getEntityName,
} from "../components/test-request/entity-name";
import { TestRequest } from "../api/types/test-request";
import TestRequestItemWaitTime from "../components/test-request/test-request-item-wait-time";

interface TestRequestCompletedProps {
  from?: string;
}

const TestRequestCompleted: React.FC<TestRequestCompletedProps> = () => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const { currentOrdersDate } = useOrderDate();
  const [selectedItems, setSelectedItems] = useState<TestRequestSelection>({});
  const [expandedItems, setExpandedItems] = useState<{
    [key: string]: boolean;
  }>({});

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
    setTestConcept,
    itemLocation,
    setItemLocation,
    allTests,
    setAllTests,
  } = useTestRequestResource({
    v: ResourceRepresentation.Full,
    itemStatus: TestRequestItemStatusCompleted,
    minActivatedDate: currentOrdersDate,
    testConceptTests: false,
    samples: true,
    includeTestItemSamples: true,
    allTests: false,
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
    { id: 4, header: t("orderer", "Ordered By"), key: "orderer" },
    { id: 5, header: t("urgency", "Urgency"), key: "urgency" },
    { id: 7, header: "", key: "actions" },
    { id: 6, header: "detailsTests", key: "detailsTests" },
    { id: 7, header: "detailsTests", key: "detailsInfo" },
    { id: 8, header: "detailsSamples", key: "detailsSamples" },
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
    { id: 6, header: "", key: "actions" },
  ];

  const tableRows = useMemo(() => {
    return items?.map((entry) => ({
      id: entry?.uuid,
      dateCreated: entry.dateCreated,
      date: (
        <span className={styles["single-line-display"]}>
          {formatDate(parseDate(entry?.dateCreated as any as string))}
        </span>
      ),
      patient: <EntityName testRequest={entry as TestRequest} />,
      identifier: entry?.referralInExternalRef ?? entry?.patientIdentifier,
      requestNumber: entry?.requestNo,
      orderer: `${entry?.providerFamilyName ?? ""} ${
        entry?.providerMiddleName ?? ""
      } ${entry?.providerGivenName ?? ""}`,
      urgency: entry?.urgency,
      actions: (
        <PrintTestRequestButton
          testRequestUuid={entry.uuid}
          enableResults={entry?.tests?.some((p) => p.testResult)}
        />
      ),
      detailsSamples: entry?.samples ?? [],
      detailsInfo: <TestRequestInfo testRequest={entry} />,
      detailsTests:
        entry?.tests
          ?.sort(
            (x, y) =>
              x.toLocationName?.localeCompare(y.toLocationName, undefined, {
                ignorePunctuation: true,
              }) ||
              (x.testName ?? x.testShortName)?.localeCompare(
                y.testName ?? y.testShortName,
                undefined,
                {
                  ignorePunctuation: true,
                }
              )
          )
          .map((test) => ({
            id: test.uuid,
            toLocationName: test.toLocationName,
            testName: formatTestName(test.testName, test.testShortName),
            orderNumber: test.orderNumber,
            atLocationName: test.atLocationName,
            samples: (
              <div>
                {test.samples?.map((sample) => (
                  <Tag type="green">
                    <SampleReferenceDisplay
                      showPrint={true}
                      reference={sample.accessionNumber}
                      className={styles.testSampleReference}
                      sampleUuid={sample.uuid}
                      sampleType={sample.sampleTypeName}
                      entityName={getEntityName(entry as TestRequest)}
                    />
                  </Tag>
                ))}
              </div>
            ),
            status: (
              <>
                {t(getDescriptiveStatus(test, t))}
                {test?.worksheetNo && (
                  <div>
                    <a
                      href={URL_LAB_WORKSHEET_VIEW_ABS(test?.worksheetUuid)}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate({
                          to: URL_LAB_WORKSHEET_VIEW_ABS(test?.worksheetUuid),
                        });
                      }}
                    >
                      {test?.worksheetNo}
                    </a>
                  </div>
                )}
                {test?.permission?.canViewTestResults && (
                  <div>
                    {test?.testResult?.obs?.display?.indexOf(":") > 0
                      ? test?.testResult?.obs?.display?.substring(
                          test?.testResult?.obs?.display?.indexOf(":") + 1
                        )
                      : test?.testResult?.obs?.display}
                  </div>
                )}
                {(test.status == TestRequestItemStatusCancelled ||
                  test.requestApprovalRemarks) && (
                  <div>
                    <div className={styles.approvalRemarks}>
                      {test.requestApprovalRemarks}
                    </div>
                  </div>
                )}
              </>
            ),
            waitTime: (
              <TestRequestItemWaitTime testRequestItem={test} translator={t} />
            ),
            actions: (
              <div
                className={`${styles.clearGhostButtonPadding} ${styles.rowActions}`}
              >
                {test?.permission?.canEditTestResults && (
                  <EditTestResultButton
                    testRequest={entry}
                    testRequestItem={test}
                  />
                )}
                <PrintTestRequestButton
                  testRequestUuid={entry.uuid}
                  enableResults={!!test?.testResult}
                  testRequestItemUuid={test.uuid}
                />
              </div>
            ),
          })) ?? [],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

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
          getToolbarProps,
          expandRow,
        }) => {
          const onExpandRow = (e: MouseEvent, rowId: string) => {
            expandedItems[rowId] = Boolean(!expandedItems[rowId]);
            expandRow(rowId);
          };
          return (
            <TableContainer className={styles.tableContainer}>
              <TableToolbar
                {...getToolbarProps()}
                style={{
                  position: "static",
                  margin: 0,
                }}
              >
                <TableToolbarContent
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <TableToolbarSearch
                    placeholder={t(
                      "laboratoryFilterRequests",
                      "Filter Requests..."
                    )}
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
                    return (
                      <React.Fragment key={row.id}>
                        <TableExpandRow
                          className={
                            isDesktop ? styles.desktopRow : styles.tabletRow
                          }
                          {...getRowProps({ row })}
                          key={row.id}
                          isExpanded={Boolean(expandedItems[row.id])}
                          onExpand={(e) => onExpandRow(e, row.id)}
                        >
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
                          <section
                            className={`${styles.rowExpandedContent} ${styles.worksheetItems}`}
                          >
                            <TestRequestCompletedItemList
                              tests={row.cells[row.cells.length - 3].value}
                              tableHeaders={testTableHeaders}
                              onSelectionChange={setSelectedItems}
                              selectedItems={selectedItems}
                              testRequestId={row.id}
                              testRequest={items.find((p) => p.uuid == row.id)}
                            />
                            <>{row.cells[row.cells.length - 2].value}</>
                            <div style={{ width: "100%" }}></div>
                            <TestRequestSampleList
                              testRequest={items.find((p) => p.uuid == row.id)}
                              canEditSamples={false}
                              canDoSampleCollecton={false}
                              disableReleaseForTesting={true}
                              testRequestId={row.id}
                              samples={row.cells[row.cells.length - 1].value}
                              expandRow={expandRow}
                            />
                          </section>
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
                        {t("noItemsToDisplay", "No items to display")}
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

export default TestRequestCompleted;
