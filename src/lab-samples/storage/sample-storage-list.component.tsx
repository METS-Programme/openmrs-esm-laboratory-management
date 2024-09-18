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
  Tag,
  Search,
  MultiSelect,
} from "@carbon/react";
import { MisuseOutline } from "@carbon/react/icons";
import {
  isDesktop,
  showModal,
  useSession,
  userHasAccess,
} from "@openmrs/esm-framework";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ResourceRepresentation } from "../../api/resource-filter-criteria";
import debounce from "lodash-es/debounce";
import {
  TASK_LABMANAGEMENT_REPOSITORY_MUTATE,
  TASK_LABMANAGEMENT_TESTRESULTS_APPROVE,
  TASK_LABMANAGEMENT_TESTRESULTS_MUTATE,
} from "../../config/privileges";
import { applyTestRequestAction } from "../../api/test-request.resource";
import { useSampleResource } from "../../api/sample.resource";
import styles from "../../tests-ordered/laboratory-queue.scss";
import { useOrderDate } from "../../hooks/useOrderDate";

import { formatDateTimeForDisplay } from "../../utils/date-utils";
import TableSelectRow from "../../components/carbon/TableSelectRow";
import {
  ApprovalActionApproved,
  ApprovalActionRejected,
} from "../../api/types/approval-action";
import { handleMutate } from "../../api/swr-revalidation";
import { URL_API_SAMPLE, URL_API_TEST_REQUEST } from "../../config/urls";
import FilterLaboratoryTests from "../../tests-ordered/filter-laboratory-tests.component";
import {
  TestRequestAction,
  TestResultActionTypeDisposeSample,
  TestResultActionTypeResultApprove,
} from "../../api/types/test-request";
import { SampleReferenceDisplay } from "../../components/sample-reference-display";
import {
  SampleSelection,
  SampleStatusArchived,
  StorageStatuses,
} from "../../api/types/sample";
import SampleTestItemList from "./sample-test-item-list.component";
import StorageSelector from "../../components/storage/storage-selector.component";
import LabSectionSelector from "../../components/locations-selector/lab-sections-selector.component";
import { TestRequestItemStatuses } from "../../api/types/test-request-item";
import { useLaboratoryConfig } from "../../hooks/useLaboratoryConfig";
import ConceptMembersFilterSelector from "../../components/concepts-selector/concept-members-filter-selector.component";
import ArchiveSampleButton from "../archive-sample-button.component";
import CheckOutSampleButton from "../checkout-sample-button.component";
import SampleActivityList from "./sample-activity-list.component";
import { closeOverlay, launchOverlay } from "../../components/overlay/hook";
import StorageActionDialog from "../dialog/storage-action-dialog.component";
import {
  getEntityName,
  getSampleEntityName,
} from "../../components/test-request/entity-name";

interface SampleStorageListProps {
  from?: string;
}

const SampleStorageList: React.FC<SampleStorageListProps> = () => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const userSession = useSession();
  const [canDisponseSamples, setCanApproveTestResults] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SampleSelection>({});
  const [expandedItems, setExpandedItems] = useState<{
    [key: string]: boolean;
  }>({});

  const {
    laboratoryConfig: { laboratorySpecimenTypeConcept },
    configReady,
  } = useLaboratoryConfig();

  useEffect(() => {
    setCanApproveTestResults(
      userSession?.user &&
        (userHasAccess(
          TASK_LABMANAGEMENT_TESTRESULTS_MUTATE,
          userSession.user
        ) ||
          userHasAccess(TASK_LABMANAGEMENT_REPOSITORY_MUTATE, userSession.user))
    );
  }, [userSession.user]);

  const {
    isLoading,
    items,
    totalCount,
    currentPageSize,
    pageSizes,
    currentPage,
    setCurrentPage,
    setPageSize,
    setSampleRef,
    isValidating,
    loaded,
    setMinActivatedDate,
    minActivatedDate,
    setMaxActivatedDate,
    maxActivatedDate,
    testItemLocation,
    setTestItemLocation,
    testConcept,
    setTestConcept,
    sampleStatus,
    setSampleStatus,
    storage,
    setStorage,
    setTestItemStatus,
    sampleType,
    setSampleType,
    setStorageStatus,
    setPatientUuid,
  } = useSampleResource({
    v: ResourceRepresentation.Full,
    sampleStatus: null,
    testRequestItemStatuses: null,
    minActivatedDate: null,
    tests: false,
    repository: true,
  });

  const debouncedSearch = useMemo(
    () => debounce((searchTerm) => setSampleRef(searchTerm), 300),
    [setSampleRef]
  );

  const handleSearch = (query: string) => {
    setSearchInput(query);
    debouncedSearch(query);
  };

  const tableHeaders = [
    {
      id: 0,
      header: t("sampleType", "Sample Type"),
      key: "sampleType",
    },
    {
      id: 1,
      header: t("laboratorySampleReference", "Sample ID"),
      key: "accessionNumber",
    },
    {
      id: 11,
      header: t("laboratorySampleExternalReferences", "External ID"),
      key: "RefSampleId",
    },
    {
      id: 12,
      header: t("laboratorySampleStorageUnit", "Storage"),
      key: "storage",
    },
    {
      id: 2,
      header: t("collectionDate", "Collection Date"),
      key: "collectionDate",
    },
    {
      id: 3,
      header: t("volume", "Volume"),
      key: "volume",
    },
    { id: 4, header: t("containerType", "Container"), key: "containerType" },
    { id: 6, header: t("laboratoryReferred", "Referred"), key: "referrerOut" },
    { id: 7, header: "", key: "actions" },
  ];

  const tableRows = useMemo(() => {
    return items?.map((entry, index) => ({
      id: entry?.uuid,

      sampleType: (
        <div>
          {entry.sampleTypeName}
          <div className={styles.italic}>
            <strong>
              {entry
                ? entry?.referralFromFacilityName
                  ? entry?.referralFromFacilityName
                  : `${entry?.patientFamilyName ?? ""} ${
                      entry?.patientMiddleName ?? ""
                    } ${entry?.patientGivenName ?? ""}`
                : null}
            </strong>
          </div>
        </div>
      ),
      accessionNumber: (
        <Tag type="cyan">
          <SampleReferenceDisplay
            showPrint={true}
            reference={entry.accessionNumber}
            className={styles.testSampleReference}
            sampleUuid={entry.uuid}
            sampleType={entry.sampleTypeName}
            entityName={getSampleEntityName(entry)}
          />
        </Tag>
      ),
      storage:
        (entry.storageUnitName
          ? `${entry.storageName}/${entry.storageUnitName}`
          : "") +
        (entry.storageStatus
          ? ` ${entry.storageUnitName ? "-" : ""} ${t(entry.storageStatus)}`
          : ""),
      RefSampleId: (
        <>
          {entry.providedRef && (
            <Tag type="teal">
              <SampleReferenceDisplay
                showPrint={true}
                reference={entry.providedRef}
                className={styles.testSampleReference}
                sampleUuid={entry.uuid}
                sampleType={entry.sampleTypeName}
                entityName={getSampleEntityName(entry)}
              />
            </Tag>
          )}
          {entry.externalRef && (
            <Tag type="gray">
              <SampleReferenceDisplay
                showPrint={true}
                reference={entry.externalRef}
                className={styles.testSampleReference}
                sampleUuid={entry.uuid}
                sampleType={entry.sampleTypeName}
                entityName={getSampleEntityName(entry)}
              />
            </Tag>
          )}
        </>
      ),
      collectionDate: (
        <div>
          {entry.collectionDate
            ? formatDateTimeForDisplay(entry.collectionDate)
            : "Unknown"}
          <div>
            {entry.collectedByFamilyName} {entry.collectedByMiddleName}{" "}
            {entry.collectedByGivenName}
          </div>
        </div>
      ),
      volume: entry.volume
        ? `${entry.volume?.toLocaleString() ?? ""}${entry.volumeUnitName}`
        : "N/A",
      containerType: `${entry.containerCount ?? ""}${
        entry.containerTypeName ?? "N/A"
      }`,
      referrerOut: entry.referredOut ? (
        <div>
          {`${t("yes", "Yes")} - ${entry.referralToFacilityName}`}
          <div>{formatDateTimeForDisplay(entry.referralOutDate)}</div>
          <div>
            {entry.referralOutByFamilyName} {entry.referralOutByMiddleName}{" "}
            {entry.referralOutByGivenName}
          </div>
        </div>
      ) : (
        <div>
          {t("no", "No")}
          {" ("}
          {t(entry.status)}
          {")"}
        </div>
      ),
      actions: (
        <>
          {entry.permission.canArchiveSample && (
            <ArchiveSampleButton data={entry} />
          )}
          {entry.permission.canCheckOutSample && (
            <CheckOutSampleButton data={entry} />
          )}
        </>
      ),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const cancelSelectedRows = () => {
    setSelectedItems({});
  };

  const refreshSamples = () => {
    handleMutate(URL_API_SAMPLE);
  };

  const getSelectedItemsDescription = () => {
    return items
      .filter((p) => selectedItems[p.uuid])
      .map((entry) => (
        <div className="laboratory-test-request-approve-item">
          <p>{entry.accessionNumber}:</p>
          {entry.referralFromFacilityName
            ? entry.referralFromFacilityName
            : `${entry.patientFamilyName ?? ""}${" "}
              ${entry.patientMiddleName ?? ""} ${entry.patientGivenName ?? ""}`}
        </div>
      ));
  };

  const onDisposeConfirmation = useCallback(
    (testRequestAction: TestRequestAction) => {
      testRequestAction.actionType = TestResultActionTypeDisposeSample;
      testRequestAction.records = Object.keys(selectedItems);
      return applyTestRequestAction(testRequestAction);
    },
    [selectedItems]
  );

  const handleDisposeSamples = useCallback(() => {
    launchOverlay(
      `${t("laboratorySampleDisposeSample", "Dispose Sample(s)")}`,
      <StorageActionDialog
        closeModal={(success: boolean) => {
          if (success) {
            cancelSelectedRows();
            refreshSamples();
          }
          closeOverlay();
        }}
        actionTitle={t("laboratorySampleDisposeSample", "Dispose Sample(s)")}
        multiSamples={true}
        storageUnitRequired={false}
        remarksRequired={true}
        remarksTextLabel={t("laboratoryApproveRemarks", "Remarks")}
        actionButtonLabel={t("dispose", "Dispose")}
        onSaveCallback={onDisposeConfirmation}
        successMessageTitle={t(
          "laboratorySampleDisposeSample",
          "Dispose Sample(s)"
        )}
        successMessageBody={t(
          "laboratorySampleDisposeSampleSuccess",
          "Samples disposed successfully"
        )}
        sampleInformation={getSelectedItemsDescription()}
        approvalDescription={""}
        readonlyStorage={true}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSelectedItemsDescription, onDisposeConfirmation]);

  const onTestRequestItemStatusesChangedInternal = ({
    selectedItems,
  }: {
    selectedItems: string[];
  }): void => {
    if (!selectedItems || selectedItems.length === 0) {
      setTestItemStatus(null);
    } else {
      setTestItemStatus(
        selectedItems.reduce((p, c, i) => {
          if (i === 0) return c;
          p += (p.length > 0 ? "," : "") + c;
          return p;
        }, "")
      );
    }
  };

  const onStorageStatusesChangedInternal = ({
    selectedItems,
  }: {
    selectedItems: string[];
  }): void => {
    if (!selectedItems || selectedItems.length === 0) {
      setStorageStatus(null);
    } else {
      setStorageStatus(
        selectedItems.reduce((p, c, i) => {
          if (i === 0) return c;
          p += (p.length > 0 ? "," : "") + c;
          return p;
        }, "")
      );
    }
  };

  /*
  if (isLoading && !loaded) {
    // eslint-disable-next-line no-console
    return (
      <DataTableSkeleton role="progressbar" rowCount={3} columnCount={5} />
    );
  }*/

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
      {/* {Object.keys(selectedItems).length == 0 && ( */}
      <>
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
            enableStorage={false}
            datePickerType="range"
            maxActivatedDate={maxActivatedDate}
            minActivatedDate={minActivatedDate}
            onMaxActivatedDateChanged={setMaxActivatedDate}
            onMinActivatedDateChanged={setMinActivatedDate}
            onTestChanged={setTestConcept}
            disableTests={false}
            enableFocus={false}
            enableItemMatch={false}
            enableSampleStatus={false}
            disableLabSection={true}
            enablePatient={true}
            onPatientChanged={setPatientUuid}
          />
        </div>
        <div
          className={`${styles["labmgmt-filters"]}`}
          style={{ justifyContent: "center" }}
        >
          <ConceptMembersFilterSelector
            style={{ height: "3rem" }}
            conceptUuid={laboratorySpecimenTypeConcept}
            name="conceptUuid"
            title={""}
            placeholder={t("laboratorySampleType", "Sample Type:")}
            onChange={(e) => setSampleType(e?.uuid)}
          />
          <StorageSelector
            displayLabSection={true}
            style={{ height: "3rem" }}
            name="sampleStorageSearch"
            placeholder={t("laboratoryStorage", "Storage")}
            onChange={(e) => setStorage(e?.uuid)}
          />
          <MultiSelect
            key={"samplesRepository"}
            hideLabel={true}
            useTitleInItem={true}
            onChange={onStorageStatusesChangedInternal}
            inline
            placeholder={t("laboratoryRepositoryItemStatus", "Storage Status")}
            titleText={t("laboratoryRepositoryItemStatus", "Storage Status")}
            label={t("laboratoryRepositoryItemStatus", "Storage Status")}
            items={StorageStatuses ?? []}
            itemToString={(item) => (item ? t(item) : "")}
            selectionFeedback="top-after-reopen"
          ></MultiSelect>
          <div style={{ maxWidth: "30rem" }}>
            <LabSectionSelector
              name="labSectionSearch"
              translator={t}
              onChange={setStorage}
              value={storage}
              style={{ width: "20rem" }}
            />
          </div>
        </div>
      </>
      {/* )} */}
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
          const onSampleSelectionChange = (
            evt: React.ChangeEvent<HTMLInputElement>,
            data: { checked: boolean; id: string },
            sampleId: string
          ) => {
            const newSelectedItems = { ...selectedItems };
            if (!newSelectedItems[sampleId]) {
              newSelectedItems[sampleId] = false;
            }
            if (data.checked) {
              newSelectedItems[sampleId] = true;
            } else {
              delete newSelectedItems[sampleId];
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
                if (Boolean(item.permission?.canDisposeSample)) {
                  accum[item.uuid] = true;
                }
                return accum;
              }, newSelectedItems);
            }
            setSelectedItems(newSelectedItems);
          };

          const selectedCount = Object.entries(selectedItems).reduce(
            (accum, [k, v]) => {
              accum["allCount"] = accum["allCount"] + (v ? 1 : 0);
              return accum;
            },
            { allCount: 0 }
          );

          const batchActionProps = {
            ...getBatchActionProps({
              shouldShowBatchActions: selectedCount.allCount > 0,
              totalCount: items.length,
              totalSelected: selectedCount.allCount,
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
                return `${selectedCount.allCount} ${t(
                  "samples(s)",
                  "samples(s)"
                )} ${t("selected", "Selected")}`;
              },
              style: {
                display: selectedCount.allCount > 0 ? "" : "none",
              },
            }),
            ...{
              shouldShowBatchActions: selectedCount.allCount > 0,
              totalCount: items.length,
              totalSelected: selectedCount.allCount,
              onCancel: cancelSelectedRows,
            },
          };

          const anyCanDisponse = items.some(
            (p) => p?.permission?.canDisposeSample
          );

          const onExpandRow = (e: MouseEvent, rowId: string) => {
            expandedItems[rowId] = Boolean(!expandedItems[rowId]);
            expandRow(rowId);
          };

          return (
            <TableContainer className={styles.tableContainer}>
              {selectedCount.allCount > 0 && (
                <TableToolbar
                  {...getToolbarProps()}
                  style={{
                    position:
                      selectedCount.allCount > 0 ? "inherit" : "inherit",
                    margin: 0,
                  }}
                >
                  <TableBatchActions {...batchActionProps}>
                    {canDisponseSamples && (
                      <>
                        <TableBatchAction
                          kind="danger"
                          renderIcon={MisuseOutline}
                          iconDescription={t(
                            "LaboratoryDisposeSamples",
                            "Dispose Sample(s)"
                          )}
                          onClick={handleDisposeSamples}
                        >
                          {t("LaboratoryDisposeSamples", "Dispose Sample(s)")}
                        </TableBatchAction>
                      </>
                    )}
                  </TableBatchActions>
                </TableToolbar>
              )}
              <Table
                {...getTableProps()}
                className={styles.activePatientsTable}
              >
                <TableHead>
                  <TableRow>
                    <TableExpandHeader />
                    {anyCanDisponse && (
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
                          selectedCount.allCount > 0
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
                    const enableSelection =
                      anyCanDisponse &&
                      items.find((x) => x.uuid == row.id)?.permission
                        ?.canDisposeSample;
                    return (
                      <React.Fragment key={row.id}>
                        <TableExpandRow
                          className={`${
                            isDesktop ? styles.desktopRow : styles.tabletRow
                          }${
                            !enableSelection && anyCanDisponse
                              ? ` ${styles.selectionPaddingClear}`
                              : ""
                          }`}
                          {...getRowProps({ row })}
                          isExpanded={Boolean(expandedItems[row.id])}
                          onExpand={(e) => onExpandRow(e, row.id)}
                          key={row.id}
                        >
                          {enableSelection ? (
                            <TableSelectRow
                              {...getSelectionProps({
                                row,
                              })}
                              checked={Boolean(selectedItems[row.id])}
                              onChange={(e, v) =>
                                onSampleSelectionChange(e, v, row.id)
                              }
                            />
                          ) : (
                            anyCanDisponse && <TableCell></TableCell>
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
                        {expandedItems[row.id] && (
                          <TableExpandedRow
                            className={styles.tableExpandedRow}
                            colSpan={
                              headers.length + 1 + (anyCanDisponse ? 1 : 0)
                            }
                          >
                            <section
                              className={`${styles.rowExpandedContent} ${styles.worksheetItems}`}
                            >
                              <SampleTestItemList sampleUuid={row.id} />
                              <div style={{ width: "100%" }}></div>
                              <SampleActivityList sampleUuid={row.id} />
                            </section>
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
                        {t("noSamplesToDisplay", "No samples to display")}
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

export default SampleStorageList;
