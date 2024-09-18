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
  DataTableSkeleton,
} from "@carbon/react";
import {
  formatDate,
  isDesktop,
  navigate,
  parseDate,
} from "@openmrs/esm-framework";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../tests-ordered/laboratory-queue.scss";
import {
  getDescriptiveStatus,
  TestRequestItemStatusCancelled,
} from "../../api/types/test-request-item";
import { useTestRequestItemResource } from "../../api/test-request-item.resource";
import { ResourceRepresentation } from "../../api/resource-filter-criteria";
import {
  URL_LAB_REQUESTS_ALL_ABS_REQUEST_NO,
  URL_LAB_WORKSHEET_VIEW_ABS,
} from "../../config/urls";
import { formatTestName } from "../../components/test-name";
import { formatAsPlainDateForTransfer } from "../../utils/date-utils";

interface SampleTestItemListProps {
  sampleUuid: string;
}

const SampleTestItemList: React.FC<SampleTestItemListProps> = ({
  sampleUuid,
}) => {
  const { t } = useTranslation();

  const { items, isLoading, loaded } = useTestRequestItemResource({
    v: ResourceRepresentation.Default,
    sample: sampleUuid,
    worksheetInfo: true,
    limit: 100,
  });
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
      header: t("laboratoryRequestNumber", "Request Number"),
      key: "requestNumber",
    },
    {
      id: 4,
      header: t("status", "Status"),
      key: "status",
    },
    { id: 6, header: "", key: "actions" },
  ];

  const tableRows = useMemo(() => {
    return items?.map((test) => ({
      id: test.uuid,
      date: (
        <span className={styles["single-line-display"]}>
          {formatDate(parseDate(test?.dateCreated as any as string))}
        </span>
      ),
      requestNumber: (
        <a
          href={URL_LAB_REQUESTS_ALL_ABS_REQUEST_NO(
            test.testRequestNo,
            formatAsPlainDateForTransfer(test.dateCreated)
          )}
          target="_blank"
        >
          {test.testRequestNo}
        </a>
      ),
      toLocationName: test.toLocationName,
      testName: formatTestName(test.testName, test.testShortName),
      orderNumber: test.orderNumber,
      atLocationName: test.atLocationName,
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
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  if (isLoading && !loaded) {
    // eslint-disable-next-line no-console
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <>
      <DataTable
        rows={tableRows}
        headers={testTableHeaders}
        isSortable
        useZebraStyles
        overflowMenuOnHover={true}
        render={({
          rows,
          headers,
          getHeaderProps,
          getTableProps,
          getRowProps,
        }) => {
          return (
            <TableContainer className={styles.tableContainer}>
              <Table
                {...getTableProps()}
                className={styles.activePatientsTable}
              >
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
                          className={`${
                            isDesktop ? styles.desktopRow : styles.tabletRow
                          }`}
                          {...getRowProps({ row })}
                          key={row.id}
                          id={`tr-test-${row.id}`}
                        >
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

export default SampleTestItemList;
