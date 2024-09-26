import React from "react";
import { decodeEncodedBarcode } from "../utils/barcode";
import { Printer } from "@carbon/react/icons";
import { Button } from "@carbon/react";
import styles from "./sample-reference-display.scss";
import { useLaboratoryConfig } from "../hooks/useLaboratoryConfig";
export const SampleReferenceDisplay = ({
  reference,
  className,
  sampleUuid,
  showPrint,
  sampleType,
  entityName,
}: {
  reference: string;
  className: string;
  sampleType: string;
  entityName: string;
  sampleUuid?: string;
  showPrint?: boolean;
}) => {
  const {
    laboratoryConfig: { laboratoryBarcodePrintUri: laboratoryBarCodePrintUri },
  } = useLaboratoryConfig();
  const decodedReference = decodeEncodedBarcode(reference);

  const handlePrint = (barcode: string) => {
    window.open(
      laboratoryBarCodePrintUri
        .replace("%BARCODE%", barcode)
        .replace("%TYPE%", sampleType)
        .replace("%NAME%", entityName),
      "_blank",
      "noreferrer"
    );
  };

  return (
    <span
      title={decodedReference}
      className={`${showPrint ? styles.showPrint : ""} ${className ?? ""}`}
    >
      <span>{reference}</span>
      {showPrint && (
        <Button
          hasIconOnly
          className={styles.generateBtn}
          kind="ghost"
          size="sm"
          onClick={(e) => handlePrint(reference)}
          renderIcon={(props) => <Printer size={16} {...props} />}
        />
      )}
    </span>
  );
};
