import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  DataTable,
  DataTableSkeleton,
  TabPanel,
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
  Button,
  InlineLoading,
  TableToolbarMenu,
  TableToolbarAction,
  TableExpandRow,
  TableExpandedRow,
  TableSelectRow,
  TableExpandHeader,
  DatePicker,
  DatePickerInput,
  Select,
  SelectItem,
  TableBatchActions,
  TableBatchAction,
  ProgressBar,
} from "@carbon/react";
import {
  isDesktop,
  restBaseUrl,
  showModal,
  useLocations,
  userHasAccess,
  useSession,
} from "@openmrs/esm-framework";
import NewReportActionButton from "./new-report-button.component";

import styles from "../../tests-ordered/laboratory-queue.scss";
import labReportStyles from "./lab-reports.scss";
import {
  DATE_PICKER_CONTROL_FORMAT,
  DATE_PICKER_FORMAT,
  formatDisplayDateTime,
} from "../../utils/date-utils";
import {
  BatchJobStatusCancelled,
  BatchJobStatusCompleted,
  BatchJobStatuses,
  BatchJobStatusExpired,
  BatchJobStatusFailed,
  BatchJobStatusPending,
  BatchJobStatusRunning,
  BatchJobTypeMigration,
  BatchJobTypeReport,
  isBatchJobStillActive,
  parseParametersToMap,
} from "../../api/types/batch-job";
import {
  CheckmarkOutline,
  Copy,
  Download,
  IncompleteCancel,
  MisuseOutline,
  View,
  WarningAltFilled,
  Error,
} from "@carbon/react/icons";
import { handleMutate } from "../../api/swr-revalidation";
import {
  URL_API_BATCH_JOB,
  URL_API_LAB_REPORTS,
  URL_BATCH_JOB_ARTIFACT,
} from "../../config/urls";
import { TASK_LABMANAGEMENT_REPORTS_MUTATE } from "../../config/privileges";
import {
  cancelBatchJobs,
  useBatchJobResource,
} from "../../api/batch-job.resource";
import { ResourceRepresentation } from "../../api/resource-filter-criteria";
import { useLaboratoryConfig } from "../../hooks/useLaboratoryConfig";
import BatchJobParameterInfo from "../../components/batch-job/parameter-info.component";
import CreateReport, {
  ReportModel,
} from "../generate-report/create-lab-report.component";
import { ReportParameter } from "../../api/types/report-type";
import { launchOverlay } from "../../components/overlay/hook";
import { ClickElement } from "../../utils/elementUtil";

const LabReportsList: React.FC = () => {
  const { t } = useTranslation();
  const {
    laboratoryConfig: { laboratoryLocationTag },
  } = useLaboratoryConfig();
  const locations = useLocations(laboratoryLocationTag);
  const [canCreateReports, setCanCreateReports] = useState(false);
  const handleRefresh = () => {
    handleMutate(URL_API_LAB_REPORTS);
  };
  const {
    items: reports,
    isLoading,
    currentPage,
    pageSizes,
    totalCount,
    currentPageSize,
    setCurrentPage,
    setPageSize,
    batchJobType,
    setBatchJobType,
    status,
    setStatus,
    locationScopeUuid,
    setLocationScopeUuid,
    dateCreatedMin,
    setDateCreatedMin,
    dateCreatedMax,
    setDateCreatedMax,
    completedDateMin,
    setCompletedDateMin,
    completedDateMax,
    setCompletedDateMax,
    loaded,
    isValidating,
  } = useBatchJobResource(
    {
      batchJobType: `${BatchJobTypeReport},${BatchJobTypeMigration}`,
      v: ResourceRepresentation.Default,
      limit: 10,
      totalCount: true,
    },
    10000
  );

  const userSession = useSession();

  useEffect(() => {
    setCanCreateReports(
      userSession?.user &&
        userHasAccess(TASK_LABMANAGEMENT_REPORTS_MUTATE, userSession.user)
    );
  }, [userSession.user]);

  const tableHeaders = useMemo(
    () => [
      {
        key: "checkbox",
        header: "",
      },
      {
        key: "description",
        header: t("LabManagementReportListDescription", "Description"),
      },
      {
        key: "parameters",
        header: t("LabManagementReportListParameters", "Parameters"),
      },
      {
        key: "requesteddate",
        header: t("LabManagementReportListRequestedDate", "Requested Date"),
      },
      {
        key: "owners",
        header: t("LabManagementReportListOwners", "Owner"),
      },
      {
        key: "status",
        header: t("LabManagementReportListStatus", "Status"),
      },
      {
        key: "actions",
        header: "",
      },
      {
        key: "details",
        header: t("LabManagementReportListDetails", "Details"),
      },
    ],
    [t]
  );

  const onDownloadReportClick = useCallback(
    (uuid: string, fileExit: string | undefined | null) => {
      if (uuid) {
        window.open(URL_BATCH_JOB_ARTIFACT(uuid, true), "_blank");
      }
    },
    []
  );

  const displayParameterMap = (
    batchJobUuid: string,
    parameterMap: { [key: string]: { [key: string]: string } } | null
  ): React.ReactNode => {
    if (!parameterMap) {
      return null;
    }
    let objectKeys: string[] = Object.keys(parameterMap);
    if (objectKeys.length === 0) {
      return null;
    }
    return objectKeys.map((key, index) => {
      let displayField: string = parameterMap[key]["description"] ?? key;
      let displayValue: string =
        parameterMap[key]["display"] ??
        parameterMap[key]["valueDescription"] ??
        parameterMap[key]["value"];
      return (
        <div key={`${batchJobUuid}-param-${index}`}>
          <span className={labReportStyles["field-label"]}>
            {displayField}:
          </span>
          <span className={labReportStyles["field-value"]}>{displayValue}</span>
        </div>
      );
    });
  };

  const onCloneReportClick = useCallback(
    (uuid: string) => {
      let batchJob = reports?.find((p) => p.uuid === uuid);
      if (batchJob && batchJob.parameters) {
        let parameters = parseParametersToMap(batchJob.parameters);
        if (parameters) {
          let newReport: ReportModel = {};

          if (parameters["report"]) {
            let reportType = parameters["report"] as any as string;
            newReport.reportSystemName = reportType!;
            newReport.reportName = batchJob?.description;
          }

          if (!newReport.reportSystemName) {
            return;
          }

          if (parameters[ReportParameter.Date]?.["value"]) {
            newReport.date = parameters[ReportParameter.Date]?.[
              "value"
            ] as any as Date;
          }

          if (parameters[ReportParameter.StartDate]?.["value"]) {
            newReport.startDate = parameters[ReportParameter.StartDate]?.[
              "value"
            ] as any as Date;
          }

          if (parameters[ReportParameter.EndDate]?.["value"]) {
            newReport.endDate = parameters[ReportParameter.EndDate]?.[
              "value"
            ] as any as Date;
          }

          if (parameters[ReportParameter.Location]?.["value"]) {
            newReport.locationUuid =
              parameters[ReportParameter.Location]?.["value"];
            newReport.locationName =
              parameters[ReportParameter.Location]?.["description"] ??
              parameters[ReportParameter.Location]?.["display"];
          }

          if (parameters[ReportParameter.Patient]?.["value"]) {
            newReport.patientUuid =
              parameters[ReportParameter.Patient]?.["value"];
            newReport.patientName =
              parameters[ReportParameter.Patient]?.["valueDescription"] ??
              parameters[ReportParameter.Patient]?.["display"];
          }

          if (parameters[ReportParameter.ReferralLocation]?.["value"]) {
            newReport.referralLocationUuid =
              parameters[ReportParameter.ReferralLocation]?.["value"];
            newReport.referralLocationName =
              parameters[ReportParameter.ReferralLocation]?.[
                "valueDescription"
              ] ?? parameters[ReportParameter.ReferralLocation]?.["display"];
          }

          if (parameters[ReportParameter.DiagnosticLocation]?.["value"]) {
            newReport.diagnosticLocationUuid =
              parameters[ReportParameter.DiagnosticLocation]?.["value"];
            newReport.diagnosticLocationName =
              parameters[ReportParameter.DiagnosticLocation]?.[
                "valueDescription"
              ] ?? parameters[ReportParameter.DiagnosticLocation]?.["display"];
          }
          /*
          if (parameters[ReportParameter.TestType]?.["value"]) {
            newReport.testTypeUuid =
              parameters[ReportParameter.TestType]?.["value"];
            newReport.testTypeName =
              parameters[ReportParameter.TestType]?.["description"] ??
              parameters[ReportParameter.TestType]?.["display"];
          }

          if (parameters[ReportParameter.TestOutcome]?.["value"]) {
            newReport.testOutcomeUuid =
              parameters[ReportParameter.TestOutcome]?.["value"];
            newReport.testOutcomeName =
              parameters[ReportParameter.TestOutcome]?.["description"] ??
              parameters[ReportParameter.TestOutcome]?.["display"];
          }*/

          if (parameters[ReportParameter.Tester]?.["value"]) {
            newReport.testerUuid =
              parameters[ReportParameter.Tester]?.["value"];
            newReport.testerName =
              parameters[ReportParameter.Tester]?.["valueDescription"] ??
              parameters[ReportParameter.Tester]?.["display"];
          }

          if (parameters[ReportParameter.TestApprover]?.["value"]) {
            newReport.testApproverUuid =
              parameters[ReportParameter.TestApprover]?.["value"];
            newReport.testApproverName =
              parameters[ReportParameter.TestApprover]?.["valueDescription"] ??
              parameters[ReportParameter.TestApprover]?.["display"];
          }

          if (
            parameters[ReportParameter.Limit] &&
            parameters[ReportParameter.Limit]["value"]
          ) {
            newReport.limit = parseFloat(
              parameters[ReportParameter.Limit]["value"]
            );
          }

          if (
            parameters[ReportParameter.ReferenceNumber] &&
            parameters[ReportParameter.ReferenceNumber]["value"]
          ) {
            newReport.referenceNumber =
              parameters[ReportParameter.ReferenceNumber]["value"];
          }

          launchOverlay("New Report", <CreateReport model={newReport} />);
        }
      }
    },
    [reports]
  );

  const tableRows = useMemo(() => {
    return reports?.map((batchJob) => {
      let isBatchJobActive = isBatchJobStillActive(batchJob?.status);
      let completedExecution = batchJob?.status === BatchJobStatusCompleted;
      let parameterMap: React.ReactNode;
      let executionStateMap: React.ReactNode;
      try {
        parameterMap = displayParameterMap(
          batchJob.uuid,
          parseParametersToMap(batchJob?.parameters, ["report"])
        );
      } catch (ex) {}
      try {
        executionStateMap = displayParameterMap(
          batchJob.uuid,
          parseParametersToMap(batchJob?.executionState)
        );
      } catch (ex) {}
      return {
        checkbox: isBatchJobActive,
        id: batchJob?.uuid,
        key: `key-${batchJob?.uuid}`,
        uuid: `${batchJob?.uuid}`,
        batchJobType: batchJob.batchJobType,
        description: completedExecution ? (
          <a
            rel="noreferrer"
            href={URL_BATCH_JOB_ARTIFACT(batchJob.uuid, true)}
            target={"_blank"}
          >
            {batchJob.description}
          </a>
        ) : (
          `${batchJob.description} (${batchJob.status})`
        ),
        requesteddate: formatDisplayDateTime(batchJob.dateCreated),
        parameters: parameterMap,
        owners: batchJob?.owners?.map((p, index) => (
          <div key={`${batchJob.uuid}-owner-${index}`}>{`${
            p.ownerFamilyName ?? ""
          } ${p.ownerGivenName ?? ""}`}</div>
        )),
        status: (
          <>
            {batchJob.status === BatchJobStatusPending && (
              <InlineLoading
                className={labReportStyles["queued-inline-loading"]}
                status="active"
                iconDescription="Loading"
                description="Queued..."
              />
            )}
            {batchJob.status === BatchJobStatusRunning && (
              <InlineLoading
                status="active"
                iconDescription="Loading"
                description="Generating report..."
              />
            )}
            {batchJob.status === BatchJobStatusFailed && (
              <WarningAltFilled
                className="report-failed"
                title={batchJob.status}
              />
            )}
            {batchJob.status === BatchJobStatusCancelled && (
              <MisuseOutline
                className="report-cancelled"
                title={batchJob.status}
              />
            )}
            {batchJob.status === BatchJobStatusCompleted && (
              <CheckmarkOutline
                className="report-completed"
                title={batchJob.status}
                size={16}
              />
            )}
            {batchJob.status === BatchJobStatusExpired && (
              <IncompleteCancel
                className="report-expired"
                title={batchJob.status}
              />
            )}
          </>
        ),
        details: (
          <BatchJobParameterInfo
            executionState={executionStateMap}
            batchJob={batchJob}
          />
        ),
        actions: (
          <div
            key={`${batchJob?.uuid}-actions`}
            style={{ display: "inline-block", whiteSpace: "nowrap" }}
          >
            {batchJob.outputArtifactViewable &&
              batchJob.batchJobType === "hide" && (
                <Button
                  key={`${batchJob?.uuid}-actions-view`}
                  type="button"
                  size="sm"
                  className="submitButton clear-padding-margin"
                  iconDescription={"Edit"}
                  kind="ghost"
                  renderIcon={View}
                  // onClick={(e) => onViewItem(batchJob.uuid, e)}
                />
              )}
            <Button
              type="button"
              size="sm"
              className="submitButton clear-padding-margin"
              iconDescription={"Copy"}
              kind="ghost"
              renderIcon={Copy}
              onClick={() => onCloneReportClick(batchJob.uuid)}
            />
            {batchJob?.status === BatchJobStatusCompleted &&
              (batchJob.outputArtifactSize ?? 0) > 0 && (
                <Button
                  type="button"
                  size="sm"
                  className="submitButton clear-padding-margin"
                  iconDescription={"Download"}
                  kind="ghost"
                  renderIcon={Download}
                  onClick={() =>
                    onDownloadReportClick(
                      batchJob.uuid,
                      batchJob.outputArtifactFileExt
                    )
                  }
                />
              )}
          </div>
        ),
      };
    });
  }, [reports, onCloneReportClick, onDownloadReportClick]);

  const onRejectionConfirmation = useCallback(
    (remarks: string, selectedRows: Array<string>) => {
      return cancelBatchJobs(selectedRows, remarks);
    },
    []
  );

  const cancelSelectedRows = useCallback(
    (
      event: React.MouseEvent<HTMLButtonElement>,
      selectedRows: readonly any[]
    ) => {
      if (selectedRows?.length == 0) {
        return;
      }
      const selectionJobs = selectedRows.map((p) => p.id);
      const dispose = showModal("lab-approve-test-request-dialog", {
        closeModal: (success: boolean) => {
          if (success) {
            handleMutate(URL_API_BATCH_JOB);
            ClickElement("button.cds--batch-summary__cancel");
          }
          dispose();
        },
        hideRemarks: false,
        approvalTitle: t("laboratoryReportCancel", "Cancel Job"),
        approvalDescription: (
          <div style={{ width: "100%" }}>
            {t(
              "laboratoryReportConfirmText",
              `Are you sure you want to cancel the job(s)`
            )}
          </div>
        ),
        actionButtonLabel: t("laboratoryReportCancelJob", "Cancel Job"),
        remarksRequired: true,
        approveCallback: (remarks) =>
          onRejectionConfirmation(remarks, selectionJobs),
        kind: "danger",
        successMessageTitle: t("laboratoryReportCancel", "Cancel Job"),
        successMessageBody: t(
          "laboratoryReportCancelSuccess",
          "Job has been cancelled successfully"
        ),
      });
    },
    [onRejectionConfirmation, t]
  );

  const onStatusChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    setStatus(evt.target.value);
  };

  const onLocationScopeChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    setLocationScopeUuid(evt.target.value);
  };

  const onDateCreatedChange = (dates: Date[]): void => {
    setDateCreatedMin(
      dates[0] ? JSON.stringify(dates[0]).split('"').join("") : undefined
    );
    setDateCreatedMax(
      dates[1] ? JSON.stringify(dates[1]).split('"').join("") : undefined
    );
  };

  const onDateCompletedChange = (dates: Date[]): void => {
    setCompletedDateMin(
      dates[0] ? JSON.stringify(dates[0]).split('"').join("") : undefined
    );
    setCompletedDateMax(
      dates[1] ? JSON.stringify(dates[1]).split('"').join("") : undefined
    );
  };

  if (isLoading && !loaded) {
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <main className={`omrs-main-content`}>
      <section className={styles.orderTabsContainer}>
        <div className={styles.tableOverride}>
          <div
            className={styles.tableToolbarContentHeaderText}
            style={{ marginTop: "-1rem", marginBottom: "0.5rem" }}
          >
            {t(
              "laboratoryReportDescription",
              "List of reports requested by users"
            )}
          </div>
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
            isSortable={true}
            useZebraStyles={true}
            render={({
              rows,
              headers,
              getHeaderProps,
              getTableProps,
              getRowProps,
              getSelectionProps,
              getBatchActionProps,
              selectedRows,
              getToolbarProps,
            }) => (
              <TableContainer className={styles.tableContainer}>
                <TableToolbar
                  {...getToolbarProps()}
                  style={{
                    position: selectedRows?.length > 0 ? "inherit" : "static",
                    margin: 0,
                  }}
                >
                  <TableBatchActions {...getBatchActionProps()}>
                    {canCreateReports && (
                      <TableBatchAction
                        renderIcon={(props) => <Error size={16} {...props} />}
                        iconDescription={t(
                          "labmanagementReportCancelSelectedRows",
                          "Cancel Selected Rows"
                        )}
                        onClick={(e) => cancelSelectedRows(e, selectedRows)}
                      >
                        {t("labmanagementReportCancelReport", "Cancel Report")}
                      </TableBatchAction>
                    )}
                  </TableBatchActions>

                  <TableToolbarContent
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#f4f4f4",
                    }}
                  >
                    <Select
                      className="stkpg-datable-select"
                      inline
                      id="statusFilter"
                      labelText=""
                      value={status}
                      onChange={onStatusChange}
                    >
                      <SelectItem text="All" value={""} />
                      {BatchJobStatuses?.map((p) => {
                        return <SelectItem key={p} value={p} text={p} />;
                      })}
                    </Select>
                    <Select
                      className="stkpg-datable-select"
                      inline
                      id="locationScopeId"
                      labelText=""
                      onChange={onLocationScopeChange}
                      value={locationScopeUuid}
                    >
                      <SelectItem text="All" value={""} />
                      {locations &&
                        locations.map((location) => (
                          <SelectItem
                            title={location.display}
                            key={location.uuid}
                            text={location.display}
                            value={location.uuid}
                          >
                            {location.display}
                          </SelectItem>
                        ))}
                    </Select>
                    <div style={{ fontSize: "90%" }}>
                      {t("laboratoryBatchJobRequestDate", "Requested")}:
                    </div>
                    <DatePicker
                      datePickerType="range"
                      className="date-range-filter"
                      locale="en"
                      dateFormat={DATE_PICKER_CONTROL_FORMAT}
                      onChange={onDateCreatedChange}
                    >
                      <DatePickerInput
                        id="date-picker-input-id-start"
                        autoComplete="off"
                        placeholder={DATE_PICKER_FORMAT}
                        labelText=""
                      />
                      <DatePickerInput
                        id="date-picker-input-id-finish"
                        autoComplete="off"
                        placeholder={DATE_PICKER_FORMAT}
                        labelText=""
                      />
                    </DatePicker>
                    <div style={{ fontSize: "90%" }}>
                      {t("laboratoryBatchJobCompletedDate", "Completed")}:
                    </div>
                    <DatePicker
                      datePickerType="range"
                      className="date-range-filter"
                      locale="en"
                      dateFormat={DATE_PICKER_CONTROL_FORMAT}
                      onChange={onDateCompletedChange}
                    >
                      <DatePickerInput
                        id="date-picker-input-id-start"
                        autoComplete="off"
                        placeholder={DATE_PICKER_FORMAT}
                        labelText=""
                      />
                      <DatePickerInput
                        id="date-picker-input-id-finish"
                        autoComplete="off"
                        placeholder={DATE_PICKER_FORMAT}
                        labelText=""
                      />
                    </DatePicker>
                    <TableToolbarMenu>
                      <TableToolbarAction onClick={handleRefresh}>
                        Refresh
                      </TableToolbarAction>
                    </TableToolbarMenu>
                    {canCreateReports && <NewReportActionButton />}
                  </TableToolbarContent>
                </TableToolbar>
                <Table
                  {...getTableProps()}
                  className={styles.activePatientsTable}
                >
                  <TableHead>
                    <TableRow>
                      <TableExpandHeader />
                      {canCreateReports && (
                        <TableHeader className="checkbox-column" />
                      )}
                      {headers.map(
                        (header: any, index) =>
                          header.key !== "details" &&
                          header.key !== "checkbox" && (
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
                    {rows.map((row: any, rowIndex) => {
                      return (
                        <React.Fragment key={row.id}>
                          <TableExpandRow
                            className={
                              isDesktop ? styles.desktopRow : styles.tabletRow
                            }
                            {...getRowProps({ row })}
                          >
                            {row.cells.map((cell: any, index: any) => (
                              <React.Fragment key={cell.id}>
                                {canCreateReports &&
                                  cell?.info?.header === "checkbox" && (
                                    <>
                                      {cell.value && (
                                        <TableSelectRow
                                          className="checkbox-column"
                                          {...getSelectionProps({ row })}
                                        />
                                      )}
                                      {!cell.value && (
                                        <TableCell>{cell.value}</TableCell>
                                      )}
                                    </>
                                  )}
                                {cell?.info?.header !== "details" &&
                                  cell?.info?.header !== "checkbox" && (
                                    <TableCell
                                      className={
                                        cell?.info?.header === "status"
                                          ? "report-status"
                                          : undefined
                                      }
                                    >
                                      {cell.value}
                                    </TableCell>
                                  )}
                              </React.Fragment>
                            ))}
                          </TableExpandRow>
                          <TableExpandedRow colSpan={headers.length}>
                            <div>{row.cells[row.cells.length - 1].value}</div>
                          </TableExpandedRow>
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
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
        </div>
      </section>
    </main>
  );
};

export default LabReportsList;
