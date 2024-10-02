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
  Tag,
  Button,
  TableSelectRow,
  TableSelectAll,
} from "@carbon/react";
import { isDesktop } from "@openmrs/esm-framework";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import styles from "./work-list.scss";
import { SampleReferenceDisplay } from "../components/sample-reference-display";
import { formatTestName } from "../components/test-name";
import { ArrowLeft } from "@carbon/react/icons";
import {
  SampleAccessionNumberTagType,
  WorksheetItem,
} from "../api/types/worksheet-item";
import { WorksheetSelectedItemOptions } from "../api/types/worksheet";
import { URL_LAB_REQUESTS_ALL_ABS_REQUEST_NO } from "../config/urls";
import { getWorksheetItemEntityName } from "../components/test-request/entity-name";

interface EditRightWorksheetItemsListProps {
  worksheetSelectedItems: Array<WorksheetItem>;
  selectedItemOptions: WorksheetSelectedItemOptions;
  setSelectedItemOptions: React.Dispatch<
    React.SetStateAction<WorksheetSelectedItemOptions>
  >;
  onTransferItem: (worksheetItem: WorksheetItem) => void;
  canEdit: boolean;
}

const EditRightWorksheetItemsList: React.FC<
  EditRightWorksheetItemsListProps
> = ({
  worksheetSelectedItems,
  selectedItemOptions,
  setSelectedItemOptions,
  onTransferItem,
  canEdit,
}) => {
  const { t } = useTranslation();

  const tableHeaders = [
    { id: 0, header: "", key: "actions" },
    {
      id: 1,
      header: t("laboratoryWorksheetAvailablesampleType", "Type"),
      key: "sampleType",
    },
    {
      id: 2,
      header: t("laboratorySampleReference", "Sample ID"),
      key: "accessionNumber",
    },
    { id: 3, header: t("laboratorySampleTest", "Test"), key: "test" },
  ];

  const handleTransferLeft = useCallback(
    (worksheetItem: WorksheetItem) => {
      onTransferItem(worksheetItem);
    },
    [onTransferItem]
  );

  const tableRows = useMemo(() => {
    return worksheetSelectedItems
      .sort((x, y) =>
        x.sampleAccessionNumber?.localeCompare(
          y.sampleAccessionNumber,
          undefined,
          {
            ignorePunctuation: true,
          }
        )
      )
      .map((entry, index) => {
        return {
          testRequestItemSampleUuid: entry.testRequestItemSampleUuid,
          disabled: Boolean(entry?.testResult?.obs),
          id: entry.testRequestItemSampleUuid,
          sampleType: entry.sampleTypeName,
          accessionNumber: (
            <div>
              <Tag type={SampleAccessionNumberTagType}>
                <SampleReferenceDisplay
                  showPrint={true}
                  reference={entry.sampleAccessionNumber}
                  className={styles.testSampleReference}
                  sampleUuid={entry.uuid}
                  sampleType={entry.sampleTypeName}
                  entityName={getWorksheetItemEntityName(entry)}
                />
              </Tag>
            </div>
          ),
          test: (
            <div>
              {formatTestName(entry.testName, entry.testShortName)}
              <div className={styles.worksheetTestFooter}>
                {[
                  entry.urgency,
                  ", ",
                  entry.toLocationName,
                  ", ",
                  <a
                    href={URL_LAB_REQUESTS_ALL_ABS_REQUEST_NO(
                      entry.testRequestNo,
                      ""
                    )}
                    target="_blank"
                  >
                    {entry.testRequestNo}
                  </a>,
                  ", ",
                  entry["orderNumber"],
                  ", ",
                  entry.referralFromFacilityName
                    ? `${
                        entry.referralInExternalRef
                          ? entry.referralInExternalRef + "-"
                          : ""
                      }${entry.referralFromFacilityName}`
                    : `${entry.patientIdentifier}-${
                        entry.patientFamilyName ?? ""
                      } 
                ${entry.patientGivenName ?? ""} 
                ${entry.patientMiddleName ?? ""}`,
                ]
                  .filter((p) => p)
                  .map((p, index) => (
                    <React.Fragment key={index}>{p}</React.Fragment>
                  ))}
              </div>
            </div>
          ),

          actions: Boolean(entry?.testResult?.obs) ? (
            <></>
          ) : (
            <Button
              size="lg"
              className={styles.clearIconButtonPadding}
              kind="ghost"
              onClick={(e) => handleTransferLeft(entry)}
              renderIcon={(props) => <ArrowLeft size={16} {...props} />}
            />
          ),
        };
      });
  }, [handleTransferLeft, worksheetSelectedItems]);

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
          const onSampleSelectionChange = (checked: boolean, rowId: string) => {
            let selectedRow = tableRows.find((p) => p.id == rowId);
            if (selectedRow) {
              const newSelectedItems = { ...selectedItemOptions };
              newSelectedItems[rowId] = {
                isSelected: checked,
                testRequestItemSampleUuid:
                  selectedRow.testRequestItemSampleUuid,
              };
              setSelectedItemOptions(newSelectedItems);
            }
          };

          const onAllSelectionChange = (
            evt: React.ChangeEvent<HTMLInputElement>
          ) => {
            let value = evt.target.checked;
            let newSelectedItems: WorksheetSelectedItemOptions = {};
            if (value) {
              worksheetSelectedItems?.reduce((accum, item) => {
                if (!item?.testResult?.obs) {
                  accum[item.testRequestItemSampleUuid] = {
                    testRequestItemSampleUuid: item.testRequestItemSampleUuid,
                    isSelected: true,
                  };
                }
                return accum;
              }, newSelectedItems);
            }
            setSelectedItemOptions(newSelectedItems);
          };

          const selectedCount = Object.entries(selectedItemOptions).reduce(
            (accum, [k, v]) => {
              accum["selCount"] =
                accum["selCount"] +
                (v?.isSelected && tableRows?.find((x) => x.id == k) ? 1 : 0);
              return accum;
            },
            {
              allCount: tableRows?.filter((p) => !p?.disabled)?.length ?? 0,
              selCount: 0,
            }
          );

          return (
            <TableContainer
              className={`${styles.tableContainer} ${styles.clearMargin} ${styles.wrapWhiteSpace}`}
            >
              <Table
                {...getTableProps()}
                className={styles.activePatientsTable}
              >
                <TableHead>
                  <TableRow>
                    {canEdit && (
                      <TableSelectAll
                        {...getSelectionProps({
                          onClick: onAllSelectionChange,
                        })}
                        checked={
                          tableRows.length > 0 &&
                          selectedCount.allCount > 0 &&
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
                    <TableHead></TableHead>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => {
                    return (
                      <React.Fragment key={row.id}>
                        <TableRow
                          className={`${
                            isDesktop ? styles.desktopRow : styles.tabletRow
                          } ${
                            Boolean(selectedItemOptions[row.id]?.isSelected)
                              ? styles.sampleSelected
                              : ""
                          }`}
                          {...getRowProps({ row })}
                          key={row.id}
                          id={`tr-test-${row.id}`}
                        >
                          {canEdit && (
                            <>
                              {worksheetSelectedItems?.find(
                                (p) => p.testResult?.obs
                              ) ? (
                                <TableCell></TableCell>
                              ) : (
                                <TableSelectRow
                                  {...getSelectionProps({
                                    row,
                                  })}
                                  classNames={styles.selectionCheckbox}
                                  checked={Boolean(
                                    selectedItemOptions[row.id]?.isSelected
                                  )}
                                  onChange={(e, v) =>
                                    onSampleSelectionChange(e, row.id)
                                  }
                                />
                              )}
                            </>
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
              {(tableRows?.length ?? 0) === 0 ? (
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

export default EditRightWorksheetItemsList;
