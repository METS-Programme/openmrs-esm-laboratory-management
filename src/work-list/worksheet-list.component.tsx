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
  Button,
} from "@carbon/react";
import {
  isDesktop,
  navigate,
  useSession,
  userHasAccess,
} from "@openmrs/esm-framework";
import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ResourceRepresentation } from "../api/resource-filter-criteria";
import debounce from "lodash-es/debounce";
import { TASK_LABMANAGEMENT_WORKSHEETS_MUTATE } from "../config/privileges";
import { useWorksheetResource } from "../api/worksheet.resource";
import styles from "../tests-ordered/laboratory-queue.scss";
import { useOrderDate } from "../hooks/useOrderDate";
import { formatTestName } from "../components/test-name";
import { handleMutate } from "../api/swr-revalidation";
import {
  URL_API_WORKSHEET,
  URL_LAB_WORKSHEET_NEW_ABS,
  URL_LAB_WORKSHEET_VIEW_ABS,
} from "../config/urls";
import {
  formatDateForDisplay,
  formatDateTimeForDisplay,
} from "../utils/date-utils";
import FilterLaboratoryTests from "../tests-ordered/filter-laboratory-tests.component";
import WorksheetListItems from "./worksheet-list-items.component";
import { Edit, View } from "@carbon/react/icons";
import { Worksheet } from "../api/types/worksheet";
import { useLaboratoryConfig } from "../hooks/useLaboratoryConfig";

interface RightWorksheetListProps {
  from?: string;
}

const RightWorksheetList: React.FC<RightWorksheetListProps> = () => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const userSession = useSession();
  const [canEditWorksheets, setCanEditWorksheets] = useState(false);
  const { currentOrdersDate } = useOrderDate();
  const [expandedItems, setExpandedItems] = useState<{
    [key: string]: boolean;
  }>({});
  const {
    laboratoryConfig: { laboratoryRequireSingleTestTypeForResultsImport },
  } = useLaboratoryConfig();

  useEffect(
    () => {
      setCanEditWorksheets(
        userSession?.user &&
          userHasAccess(TASK_LABMANAGEMENT_WORKSHEETS_MUTATE, userSession.user)
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
    allItems,
    setAllItems,
    status,
    setStatus,
  } = useWorksheetResource({
    v: ResourceRepresentation.Full,
    minActivatedDate: currentOrdersDate,
    testConceptTests: false,
    allItems: true,
    includeWorksheetItemConcept: true,
    includeWorksheetItemTestResult: true,
    testResultApprovals: true,
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
    { id: 0, header: t("date", "Date"), key: "worksheetDate" },
    {
      id: 1,
      header: t("laboratoryWorksheetLocation", "Lab Section"),
      key: "atLocationName",
    },
    {
      id: 1,
      header: t("laboratoryWorksheetNumber", "Sheet Number"),
      key: "worksheetNo",
    },
    {
      id: 2,
      header: t("laboratoryWorksheetTestName", "Test"),
      key: "testName",
    },
    {
      id: 3,
      header: t("laboratoryWorksheetResponsiblePerson", "Assigned To"),
      key: "responsiblePerson",
    },
    {
      id: 3,
      header: t("laboratoryWorksheetCreated", "Created"),
      key: "created",
    },
    {
      id: 4,
      header: t("laboratoryWorksheetRemarks", "Remarks"),
      key: "remarks",
    },
    { id: 5, header: t("laboratoryWorksheetStatus", "Status"), key: "status" },
    { id: 6, header: "", key: "actions" },
    { id: 7, header: "", key: "detailsItems" },
  ];

  const onEditWorksheet = (worksheet: Worksheet) => {
    navigate({
      to: URL_LAB_WORKSHEET_VIEW_ABS(worksheet.uuid),
    });
  };

  const tableRows = useMemo(() => {
    return items?.map((entry, index) => ({
      id: entry?.uuid,
      dateCreated: entry.dateCreated,
      worksheetDate: (
        <span className={styles["single-line-display"]}>
          {formatDateForDisplay(entry?.worksheetDate)}
        </span>
      ),
      atLocationName: entry.atLocationName ?? "",
      worksheetNo: entry.worksheetNo,
      testName: formatTestName(entry.testName, entry.testShortName),
      responsiblePerson: entry?.responsiblePersonUuid
        ? `${entry?.responsiblePersonFamilyName ?? ""} ${
            entry?.responsiblePersonMiddleName ?? ""
          } ${entry?.responsiblePersonGivenName ?? ""}`
        : entry.responsiblePersonOther,
      created: (
        <div>
          <div>{formatDateTimeForDisplay(entry.dateCreated)}</div>
          <div>
            {entry.creatorFamilyName} {entry.creatorGivenName}
          </div>
        </div>
      ),
      remarks: entry.remarks ?? "",
      status: t(entry?.status),
      actions:
        canEditWorksheets && entry?.permission?.canEdit ? (
          <Button
            kind="ghost"
            size="md"
            onClick={() => onEditWorksheet(entry)}
            iconDescription={t("editLaboratoryWorksheet", "Edit Worksheet")}
            renderIcon={(props) => <Edit size={16} {...props} />}
          ></Button>
        ) : (
          <Button
            kind="ghost"
            size="md"
            onClick={() => onEditWorksheet(entry)}
            iconDescription={t("editLaboratoryWorksheet", "Edit Worksheet")}
            renderIcon={(props) => <View size={16} {...props} />}
          ></Button>
        ),

      detailsItems: entry?.worksheetItems ?? [],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEditWorksheets, items]);

  const refreshTestItems = () => {
    handleMutate(URL_API_WORKSHEET);
  };

  const handleNewWorksheetClick = () => {
    navigate({ to: URL_LAB_WORKSHEET_NEW_ABS });
  };

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
                      "laboratoryFilterWorksheets",
                      "Filter Worksheets..."
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
                    focus={allItems}
                    onFocusChanged={setAllItems}
                    enableWorksheetStatus={true}
                    onWorksheetStatusChanged={setStatus}
                    worksheetStatus={status}
                  />
                  <Button
                    onClick={handleNewWorksheetClick}
                    size="md"
                    kind="primary"
                  >
                    {t("laboratoryNewWorksheet", "New Worksheet")}
                  </Button>
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
                  {rows.map((row, rowIndex) => {
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
                          {expandedItems[row.id] && (
                            <section
                              className={`${styles.rowExpandedContent} ${styles.worksheetItems}`}
                            >
                              <WorksheetListItems
                                atLocationUuid={
                                  userSession?.sessionLocation?.uuid
                                }
                                worksheetUuid={row.id}
                                key={`${row.id}${
                                  row.cells[row.cells.length - 1].value?.length
                                }`}
                                worksheetItems={
                                  row.cells[row.cells.length - 1].value
                                }
                                expandRow={expandRow}
                                requireSingleTestTypeForResultsImport={
                                  laboratoryRequireSingleTestTypeForResultsImport
                                }
                              />
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
                          "noPendingWorksheetsToDisplay",
                          "No pending worksheets to display"
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

export default RightWorksheetList;
