import {
  DataTable,
  Table,
  TableBatchActions,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
  TableSelectAll,
  TableSelectRow,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  Tag,
} from "@carbon/react";
import { CheckmarkOutline, MisuseOutline } from "@carbon/react/icons";
import { isDesktop, navigate } from "@openmrs/esm-framework";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../tests-ordered/laboratory-queue.scss";
import {
  getDescriptiveStatus,
  TestRequestItem,
} from "../api/types/test-request-item";
import { TestRequestSelection } from "../api/test-request.resource";
import { formatTestName } from "../components/test-name";
import { SampleReferenceDisplay } from "../components/sample-reference-display";
import TestResultInfo from "../components/test-request/test-result-info.component";
import TestResultApprovalList from "./test-result-approval-list.component";
import { URL_LAB_WORKSHEET_VIEW_ABS } from "../config/urls";
import TestRequestItemWaitTime from "../components/test-request/test-request-item-wait-time";
import { getEntityName } from "../components/test-request/entity-name";
import { TestRequest } from "../api/types/test-request";

interface TestRequestItemListProps {
  tests: Array<TestRequestItem>;
  tableHeaders: Array<{ id: number; header: string; key: string }>;
  onSelectionChange: React.Dispatch<React.SetStateAction<TestRequestSelection>>;
  selectedItems: TestRequestSelection;
  testRequestId: string;
  enableSelection?: boolean;
  testRequest: TestRequest;
}

const TestRequestItemList: React.FC<TestRequestItemListProps> = ({
  tests,
  tableHeaders,
  onSelectionChange,
  selectedItems,
  testRequestId,
  enableSelection,
  testRequest,
}) => {
  const { t } = useTranslation();
  const [expandedItems, setExpandedItems] = useState<{
    [key: string]: boolean;
  }>({});
  const tableRows = useMemo(() => {
    return tests
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
                  entityName={getEntityName(testRequest)}
                />
              </Tag>
            ))}
          </div>
        ),
        status: (
          <div>
            <div>
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
            </div>
            <div className={styles.approvalRemarks}>
              {test?.testResult?.obs?.display?.indexOf(":") > 0
                ? test?.testResult?.obs?.display?.substring(
                    test?.testResult?.obs?.display?.indexOf(":") + 1
                  )
                : test?.testResult?.obs?.display}
              <div>{test.requestApprovalRemarks}</div>
            </div>
          </div>
        ),
        waitTime: (
          <TestRequestItemWaitTime testRequestItem={test} translator={t} />
        ),
        testResult: "",
        details: test.uuid,
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tests]);

  return (
    <>
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
          const onAllSelectionChange = (
            evt: React.ChangeEvent<HTMLInputElement>
          ) => {
            let value = evt.target.checked;
            const newSelectedItems = { ...selectedItems };
            if (!newSelectedItems[testRequestId]) {
              newSelectedItems[testRequestId] = { tests: {}, allTests: false };
            }
            if (value) {
              newSelectedItems[testRequestId].allTests = true;
              newSelectedItems[testRequestId].tests = tests?.reduce((x, y) => {
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
            onSelectionChange(newSelectedItems);
          };

          const onTestRequestSelectionChange = (
            value: boolean,
            name: string,
            event: React.ChangeEvent<HTMLInputElement>,
            testRequestItemId: string
          ) => {
            const newSelectedItems = { ...selectedItems };
            if (!newSelectedItems[testRequestId]) {
              newSelectedItems[testRequestId] = { tests: {}, allTests: false };
            }
            if (value) {
              newSelectedItems[testRequestId].allTests =
                Object.keys(newSelectedItems[testRequestId].tests).length + 1 ==
                (tests.filter((p) => p.testResult?.permission?.canApprove)
                  ?.length ?? 0);
              newSelectedItems[testRequestId].tests[testRequestItemId] = true;
            } else {
              newSelectedItems[testRequestId].allTests = false;
              if (newSelectedItems[testRequestId]["tests"][testRequestItemId]) {
                delete newSelectedItems[testRequestId]["tests"][
                  testRequestItemId
                ];
              }
            }
            onSelectionChange(newSelectedItems);
          };
          const onExpandRow = (e: MouseEvent, rowId: string) => {
            expandedItems[rowId] = Boolean(!expandedItems[rowId]);
            expandRow(rowId);
          };

          const anyCanApprove = tests.some(
            (p) => p.testResult?.permission?.canApprove
          );

          return (
            <TableContainer className={styles.tableContainer}>
              <Table
                {...getTableProps()}
                className={styles.activePatientsTable}
              >
                <TableHead>
                  <TableRow>
                    <TableExpandHeader />
                    {enableSelection && anyCanApprove && (
                      <TableSelectAll
                        {...getSelectionProps()}
                        onSelect={onAllSelectionChange}
                        checked={Boolean(
                          selectedItems[testRequestId]?.allTests
                        )}
                        indeterminate={Boolean(
                          !selectedItems[testRequestId]?.allTests &&
                            selectedItems[testRequestId]?.tests &&
                            Object.keys(selectedItems[testRequestId]?.tests)
                              .length > 0
                        )}
                        className={styles.childTableTableSelectAll}
                      />
                    )}
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
                    const testRequestItem = tests.find((p) => p.uuid == row.id);

                    return (
                      <React.Fragment key={row.id}>
                        <TableExpandRow
                          className={`${
                            isDesktop ? styles.desktopRow : styles.tabletRow
                          } ${
                            testRequestItem?.testResult
                              ? ""
                              : styles.noTestResultsRow
                          }`}
                          {...getRowProps({ row })}
                          key={row.id}
                          id={`tr-test-${row.id}`}
                          isExpanded={Boolean(expandedItems[row.id])}
                          onExpand={(e) => onExpandRow(e, row.id)}
                        >
                          {testRequestItem?.testResult?.permission
                            ?.canApprove ? (
                            <TableSelectRow
                              {...getSelectionProps({
                                row,
                              })}
                              checked={Boolean(
                                selectedItems[testRequestId]?.tests?.[row.id]
                              )}
                              onChange={(v, n, e) =>
                                onTestRequestSelectionChange(v, n, e, row.id)
                              }
                              classNames={styles.selectionCheckbox}
                            />
                          ) : (
                            anyCanApprove && <TableCell></TableCell>
                          )}
                          {row.cells.map(
                            (cell) =>
                              cell?.info?.header !== "details" && (
                                <TableCell key={cell.id}>
                                  {cell.value}
                                </TableCell>
                              )
                          )}
                        </TableExpandRow>
                        {expandedItems[row.id] &&
                          testRequestItem?.testResult && (
                            <TableExpandedRow
                              className={`${styles.tableExpandedRow} ${styles.worksheetItemTableExpandedRow}`}
                              colSpan={headers.length + 1}
                            >
                              {expandedItems[row.id] && (
                                <div className={styles.worksheetItemRowDetails}>
                                  <TestResultInfo
                                    testConcept={testRequestItem?.testConcept}
                                    testResult={testRequestItem?.testResult}
                                  />
                                  {testRequestItem?.testResult?.approvals
                                    ?.length > 0 && (
                                    <TestResultApprovalList
                                      approvals={
                                        testRequestItem?.testResult?.approvals
                                      }
                                    />
                                  )}
                                </div>
                              )}
                            </TableExpandedRow>
                          )}
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
                        {t("noLaboratoryTestsToDisplay", "No tests to display")}
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

export default TestRequestItemList;
