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
  Tile,
  ProgressBar,
  Search,
} from "@carbon/react";
import { formatDate, isDesktop, parseDate } from "@openmrs/esm-framework";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ResourceRepresentation } from "../../api/resource-filter-criteria";
import debounce from "lodash-es/debounce";
import { useTestRequestResource } from "../../api/test-request.resource";
import styles from "../../tests-ordered/laboratory-queue.scss";
import { TestRequestItemStatusCancelled } from "../../api/types/test-request-item";
import { useOrderDate } from "../../hooks/useOrderDate";
import { formatTestName } from "../../components/test-name";
import { URL_LAB_REQUESTS_ALL_ABS_REQUEST_NO } from "../../config/urls";
import FilterLaboratoryTests from "../../tests-ordered/filter-laboratory-tests.component";
import PrintTestRequestButton from "../../print/print-test-request-action-button.component";
import EntityName from "../../components/test-request/entity-name";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { formatAsPlainDateForTransfer } from "../../utils/date-utils";
import TestRequestWaitTime from "../../components/test-request/test-request-wait-time";

interface SummaryRequestsProps {
  from?: string;
}

const SummaryRequests: React.FC<SummaryRequestsProps> = () => {
  const { t } = useTranslation();
  const locationObject = useLocation();
  const { currentOrdersDate } = useOrderDate();
  const [searchInput, setSearchInput] = useState(() => {
    return new URLSearchParams(locationObject.search).get("requestNo") ?? "";
  });
  const [startDate] = useState(() => {
    let startDateParam = new URLSearchParams(locationObject.search).get(
      "startDate"
    );
    let startDateValue: string = null;
    if (startDateParam != null && typeof startDateParam != "undefined") {
      try {
        startDateValue = startDateParam
          ? formatAsPlainDateForTransfer(dayjs(startDateParam.trim())?.toDate())
          : null;
      } catch (e) {
        startDateValue = null;
      }
    } else {
      return currentOrdersDate;
    }
    return startDateValue ?? "";
  });
  const [canRejectTest] = useState(false);

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
    setTestItemStatuses,
    testItemStatuses,
    setItemMatch,
    itemMatch,
  } = useTestRequestResource({
    v: ResourceRepresentation.Full,
    minActivatedDate: startDate,
    testConceptTests: false,
    samples: false,
    includeTestItemSamples: true,
    allTests: true,
    includeTestItemTestResult: false,
    testResultApprovals: false,
    includeItemConcept: false,
    worksheetInfo: false,
    q: searchInput,
  });

  const debouncedSearch = useMemo(
    () => debounce((searchTerm) => setSearchString(searchTerm), 300),
    [setSearchString]
  );

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
    { id: 4, header: t("orderer", "Ordered By"), key: "orderer" },
    { id: 5, header: t("urgency", "Urgency"), key: "urgency" },
    {
      id: 6,
      header: t("#tests", "# Tests"),
      key: "testsCount",
    },
    {
      id: 7,
      header: t("# Done", "# Done"),
      key: "testsDone",
    },
    {
      id: 8,
      header: t("waitTime", "Wait Time"),
      key: "waitTime",
    },
    { id: 9, header: "", key: "actions" },
  ];

  const tableRows = useMemo(() => {
    return items?.map((entry) => {
      let testsDone =
        entry?.tests?.filter(
          (p) => p.status != TestRequestItemStatusCancelled && p.completed
        )?.length ?? 0;
      let testsReferredOut =
        entry?.tests?.filter(
          (p) =>
            p.status != TestRequestItemStatusCancelled &&
            !p.completed &&
            p.referredOut
        )?.length ?? 0;
      let testNames = entry?.tests
        ?.filter((p) => p.status != TestRequestItemStatusCancelled)
        ?.map((p) => (
          <li
            className={
              p.status != TestRequestItemStatusCancelled && p.completed
                ? styles["summary-tests-done"]
                : styles["summary-tests-pending"]
            }
          >
            {formatTestName(p.testName, p.testShortName)}
          </li>
        ));
      return {
        id: entry?.uuid,
        dateCreated: entry.dateCreated,
        date: (
          <span className={styles["single-line-display"]}>
            {formatDate(parseDate(entry?.dateCreated as any as string))}
          </span>
        ),
        patient: (
          <div>
            <div>
              {entry?.referralInExternalRef ?? entry?.patientIdentifier} -{" "}
              <EntityName testRequest={entry} />
            </div>
          </div>
        ),

        requestNumber: (
          <a
            href={URL_LAB_REQUESTS_ALL_ABS_REQUEST_NO(
              entry.requestNo,
              formatAsPlainDateForTransfer(entry.dateCreated)
            )}
            target="_blank"
          >
            {entry.requestNo}
          </a>
        ),
        orderer: `${entry?.providerFamilyName ?? ""} ${
          entry?.providerMiddleName ?? ""
        } ${entry?.providerGivenName ?? ""}`,
        urgency: entry?.urgency,
        testsCount: (
          <>
            <strong>
              {entry?.tests?.filter(
                (p) => p.status != TestRequestItemStatusCancelled
              )?.length ?? 0}
            </strong>
            {testNames ? (
              <ol className={styles["summary-tests-list"]}>{testNames}</ol>
            ) : (
              ""
            )}
          </>
        ),
        testsDone:
          testsReferredOut > 0
            ? `${testsDone} (${testsReferredOut} ${t(
                "laboratorySummaryReferredOut",
                "Ref-Out"
              )})`
            : testsDone,
        waitTime: <TestRequestWaitTime testRequest={entry} translator={t} />,
        actions: (
          <PrintTestRequestButton
            testRequestUuid={entry.uuid}
            enableResults={
              entry?.tests?.some((p) => p.completed) ||
              entry?.tests?.some((p) => p.testResult)
            }
          />
        ),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRejectTest, items]);

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
      <div className={`${styles["labmgmt-filters"]}`}>
        <Search
          placeHolderText={t(
            "laboratoryFilterWorksheets",
            "Filter Requests..."
          )}
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          labelText=""
          size={"xl"}
          className={styles.filterSearch}
        />
        <FilterLaboratoryTests
          maxActivatedDate={maxActivatedDate}
          minActivatedDate={minActivatedDate}
          diagnosticCenterUuid={itemLocation}
          onMaxActivatedDateChanged={setMaxActivatedDate}
          onMinActivatedDateChanged={setMinActivatedDate}
          onDiagnosticCenterChanged={setItemLocation}
          onTestChanged={setTestConcept}
          enableFocus={false}
          enableTestRequestItemStatus={true}
          testRequestItemStatuses={testItemStatuses}
          onTestRequestItemStatusesChanged={setTestItemStatuses}
          enableItemMatch={true}
          onItemMatchChanged={setItemMatch}
          itemMatch={itemMatch}
          datePickerType="range"
        />
      </div>
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
        }) => {
          return (
            <TableContainer className={styles.tableContainer}>
              <Table
                {...getTableProps()}
                className={styles.activePatientsTable}
              >
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader
                        {...getHeaderProps({
                          header,
                          isSortable: header.isSortable,
                        })}
                        className={
                          isDesktop ? styles.desktopHeader : styles.tabletHeader
                        }
                        key={`${header.key}`}
                      >
                        {header.header?.content ?? header.header}
                      </TableHeader>
                    ))}
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
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
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
                        {t(
                          "noPendingItemsToDisplay",
                          "No pending items to display"
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

export default SummaryRequests;
