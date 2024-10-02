import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
  TableSelectAll,
  TableSelectRow,
} from "@carbon/react";
import { isDesktop } from "@openmrs/esm-framework";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./laboratory-queue.scss";
import { TestRequestItem } from "../api/types/test-request-item";
import { TestRequestSelection } from "../api/test-request.resource";

interface TestRequestItemListProps {
  tests: Array<TestRequestItem>;
  tableHeaders: Array<{ id: number; header: string; key: string }>;
  canApproveTestRequests: boolean;
  onSelectionChange: React.Dispatch<React.SetStateAction<TestRequestSelection>>;
  selectedItems: TestRequestSelection;
  testRequestId: string;
  enableSelection?: boolean;
}

const TestRequestItemList: React.FC<TestRequestItemListProps> = ({
  tests,
  canApproveTestRequests,
  tableHeaders,
  onSelectionChange,
  selectedItems,
  testRequestId,
  enableSelection,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <DataTable
        rows={tests}
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
              newSelectedItems[testRequestId].tests = rows?.reduce((x, y) => {
                x[y.id] = true;
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
                tests.length;
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
          return (
            <TableContainer className={styles.tableContainer}>
              <Table
                {...getTableProps()}
                className={styles.activePatientsTable}
              >
                <TableHead>
                  <TableRow>
                    {enableSelection && (
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
                    return (
                      <React.Fragment key={row.id}>
                        <TableRow
                          className={
                            isDesktop ? styles.desktopRow : styles.tabletRow
                          }
                          {...getRowProps({ row })}
                          key={row.id}
                          id={`tr-test-${row.id}`}
                        >
                          {enableSelection && (
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
                          )}
                          {row.cells.map(
                            (cell) =>
                              cell?.info?.header !== "details" && (
                                <TableCell key={cell.id}>
                                  {cell.value}
                                </TableCell>
                              )
                          )}
                        </TableRow>
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
