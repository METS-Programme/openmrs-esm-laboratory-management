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
  TableToolbar,
  TableToolbarContent,
  Tag,
  TableSelectRow,
  TableSelectAll,
} from "@carbon/react";
import { isDesktop } from "@openmrs/esm-framework";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./laboratory-queue.scss";
import { Sample } from "../api/types/sample";
import AddSampleActionButton from "./add-sample-action-button.component";
import { formatDateTimeForDisplay } from "../utils/date-utils";
import { TestRequestItem } from "../api/types/test-request-item";
import { SampleReferenceDisplay } from "../components/sample-reference-display";
import { formatTestName } from "../components/test-name";
import EditSampleActionLink from "./edit-sample-action-link.component";
import EditSampleActionButton from "./edit-sample-action-button.component";
import DeleteSampleActionButton from "./delete-sample-action-button.component";
import ReleaseSamplesForTestingActionButton from "./send-sample-for-testing-action-button.component";
import { getEntityName } from "../components/test-request/entity-name";
import AddExistingSampleActionButton from "./add-existing-sample.component";

interface TestRequestSampleListProps {
  samples: Array<Sample>;
  canEditSamples: boolean;
  canDoSampleCollecton: boolean;
  testRequestId: string;
  testRequest: TestRequestItem;
  expandRow: (rowId: string) => void;
  disableReleaseForTesting?: boolean;
}

const TestRequestSampleList: React.FC<TestRequestSampleListProps> = ({
  samples,
  canEditSamples,
  testRequest,
  canDoSampleCollecton,
  disableReleaseForTesting,
}) => {
  const { t } = useTranslation();
  const [selectedItems, setSelectedItems] = useState<{
    [key: string]: boolean;
  }>({});

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
    { id: 5, header: t("laboratorySampleTests", "Tests"), key: "tests" },
    { id: 6, header: t("laboratoryReferred", "Referred"), key: "referrerOut" },
    { id: 7, header: "", key: "actions" },
  ];

  const tableRows = useMemo(() => {
    return samples?.map((entry, index) => ({
      id: entry?.uuid,
      disabled:
        disableReleaseForTesting || !entry?.permission?.canReleaseForTesting,
      sampleType: entry.sampleTypeName,
      accessionNumber:
        canEditSamples && entry?.permission?.canEdit ? (
          <EditSampleActionLink
            testRequest={testRequest}
            sample={entry}
            refClassName={styles.testSampleReference}
          />
        ) : (
          <Tag type="cyan">
            <SampleReferenceDisplay
              showPrint={true}
              reference={entry.accessionNumber}
              className={styles.testSampleReference}
              sampleUuid={entry.uuid}
              sampleType={entry.sampleTypeName}
              entityName={getEntityName(testRequest)}
            />
          </Tag>
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
      tests: (
        <div>
          {(entry.tests as Array<TestRequestItem>)?.map((test) => (
            <Tag type="blue">
              <span className={styles.testRequestSampleTest}>
                {formatTestName(test.testName, test.testShortName)}{" "}
              </span>
            </Tag>
          ))}
        </div>
      ),
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
          {entry.storageStatus ? (
            <>
              {" ("}
              {t(entry.storageStatus)}
              {")"}
            </>
          ) : (
            ""
          )}
        </div>
      ),
      actions:
        canEditSamples && entry?.permission?.canEdit ? (
          <div
            className={`${styles.clearGhostButtonPadding} ${styles.rowActions}`}
          >
            <EditSampleActionButton sample={entry} testRequest={testRequest} />
            {entry?.permission?.canDelete && (
              <DeleteSampleActionButton
                sample={entry}
                testRequest={testRequest}
              />
            )}
          </div>
        ) : (
          ""
        ),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [samples]);

  return (
    <>
      <DataTable
        headers={tableHeaders}
        rows={tableRows}
        isSortable
        useZebraStyles
        overflowMenuOnHover={true}
        render={({
          rows,
          headers,
          getHeaderProps,
          getTableProps,
          getRowProps,
          getSelectionProps,
        }) => {
          const onSampleSelectionChange = (
            checked: boolean,
            sampleId: string
          ) => {
            const newSelectedItems = { ...selectedItems };
            newSelectedItems[sampleId] = checked;
            setSelectedItems(newSelectedItems);
          };

          const onAllSelectionChange = (
            evt: React.ChangeEvent<HTMLInputElement>
          ) => {
            let value = evt.target.checked;
            let newSelectedItems = {};
            if (value) {
              samples.reduce((accum, item) => {
                if (item?.permission?.canReleaseForTesting) {
                  accum[item.uuid] = true;
                }
                return accum;
              }, newSelectedItems);
            }
            setSelectedItems(newSelectedItems);
          };

          const selectedCount = Object.entries(selectedItems).reduce(
            (accum, [k, v]) => {
              accum["selCount"] = accum["selCount"] + (v ? 1 : 0);
              return accum;
            },
            {
              allCount: samples.filter(
                (p) => p.permission?.canReleaseForTesting
              ).length,
              selCount: 0,
            }
          );

          const anyCanReleaseForTesting = samples.some(
            (p) => p.permission?.canReleaseForTesting
          );

          return (
            <TableContainer className={styles.tableContainer}>
              <TableToolbar
                style={{
                  position: "static",
                  margin: 0,
                }}
              >
                <TableToolbarContent
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div className={styles.tableToolbarContentHeaderText}>
                    {t(
                      "laboratoryPatientCollectedSamples",
                      "Collected Samples"
                    )}
                  </div>

                  {canDoSampleCollecton && (
                    <>
                      {Object.entries(selectedItems).filter(([k, v]) => v)
                        .length > 0 && (
                        <ReleaseSamplesForTestingActionButton
                          sampleIds={selectedItems}
                          sampleCollection={samples}
                        />
                      )}
                    </>
                  )}
                  {canDoSampleCollecton && (
                    <div style={{ display: "flex", flexDirection: "row" }}>
                      <AddExistingSampleActionButton
                        testRequest={testRequest}
                      />
                      <AddSampleActionButton testRequest={testRequest} />
                    </div>
                  )}
                </TableToolbarContent>
              </TableToolbar>
              <Table
                {...getTableProps()}
                className={styles.activePatientsTable}
              >
                <TableHead>
                  <TableRow>
                    {canDoSampleCollecton && anyCanReleaseForTesting && (
                      <TableSelectAll
                        {...getSelectionProps({
                          onClick: onAllSelectionChange,
                        })}
                        checked={
                          samples.length > 0 &&
                          selectedCount.allCount == selectedCount.selCount
                        }
                        indeterminate={
                          selectedCount.allCount != selectedCount.selCount &&
                          selectedCount.selCount > 0
                        }
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
                    {canEditSamples && <TableHead></TableHead>}
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
                          {canDoSampleCollecton &&
                            (samples.find((p) => p.uuid == row.id)?.permission
                              ?.canReleaseForTesting ? (
                              <TableSelectRow
                                {...getSelectionProps({
                                  row,
                                })}
                                classNames={styles.selectionCheckbox}
                                checked={Boolean(selectedItems[row.id])}
                                onChange={(e, v) =>
                                  onSampleSelectionChange(e, row.id)
                                }
                              />
                            ) : (
                              anyCanReleaseForTesting && <TableCell></TableCell>
                            ))}
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
              {(samples?.length ?? 0) === 0 ? (
                <div className={styles.tileContainer}>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>
                        {t(
                          "noLaboratorySamplesToDisplay",
                          "No samples to display"
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
    </>
  );
};

export default TestRequestSampleList;
