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
  TabPanel,
  TableToolbar,
  TableToolbarContent,
  Tag,
  Button,
  TableSelectRow,
  TableSelectAll,
} from "@carbon/react";
import { isDesktop } from "@openmrs/esm-framework";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../tests-ordered/laboratory-queue.scss";
import { Sample } from "../api/types/sample";

import { formatDateTimeForDisplay } from "../utils/date-utils";
import { TestRequestItem } from "../api/types/test-request-item";
import { SampleReferenceDisplay } from "../components/sample-reference-display";
import { formatTestName } from "../components/test-name";
import { getEntityName } from "../components/test-request/entity-name";

interface TestRequestSampleListProps {
  samples: Array<Sample>;
  testRequestId: string;
  testRequest: TestRequestItem;
  expandRow: (rowId: string) => void;
}

const TestRequestSampleList: React.FC<TestRequestSampleListProps> = ({
  samples,
  testRequest,
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
    ,
  ];

  const tableRows = useMemo(() => {
    return samples?.map((entry, index) => ({
      id: entry?.uuid,
      disabled: !entry?.permission?.canReleaseForTesting,
      sampleType: entry.sampleTypeName,
      accessionNumber: (
        <SampleReferenceDisplay
          showPrint={true}
          reference={entry.accessionNumber}
          className={styles.testSampleReference}
          sampleType={entry.sampleTypeName}
          entityName={getEntityName(testRequest)}
        />
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
      containerType: `${entry.containerCount ?? ""} ${
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
        <div>{t("no", "No")}</div>
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
                </TableToolbarContent>
              </TableToolbar>
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
                          className={
                            isDesktop ? styles.desktopRow : styles.tabletRow
                          }
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
