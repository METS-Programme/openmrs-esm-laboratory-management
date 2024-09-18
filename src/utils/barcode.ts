import { idGenGenerateId } from "../api/identifier.resource";
import {
  formatAsPlainDateForTransfer,
  getDateOfIsoWeek,
  today,
  weekNumber,
} from "./date-utils";
import { GenerateSpecimenId } from "../api/uganda-emr.resource";

export const BarcodeFormatNumberPlain = "number_plain";
export const BarcodeFormatYearMonthDayNumber = "year2_month2_day2_number";
export const BarcodeFormatDateNumber48Bit = "date_number_48bit";
export const BarcodeFormatUgandaEMR = "ugemr";
export const BarcodeGenerationAlgorithms = [
  BarcodeFormatNumberPlain,
  BarcodeFormatYearMonthDayNumber,
  BarcodeFormatDateNumber48Bit,
  BarcodeFormatUgandaEMR,
] as const;
export type BarcodeGenerationAlgorithm =
  (typeof BarcodeGenerationAlgorithms)[number];

export const generateSpecimentBarCode = (
  barcodeAlgorithm: BarcodeGenerationAlgorithm,
  idGenIdentifierSourceUuid: string
): Promise<string> => {
  switch (barcodeAlgorithm) {
    case BarcodeFormatUgandaEMR:
      return GenerateSpecimenId().then(
        (resp) => {
          return Promise.resolve(resp.data.results[0].sampleId);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    case BarcodeFormatNumberPlain:
    case BarcodeFormatYearMonthDayNumber:
    case BarcodeFormatDateNumber48Bit:
    default:
      return idGenGenerateId(idGenIdentifierSourceUuid).then(
        (resp) => {
          if (barcodeAlgorithm == BarcodeFormatNumberPlain) {
            return Promise.resolve(resp.data.identifier);
          } else if (barcodeAlgorithm == BarcodeFormatDateNumber48Bit) {
            let todayDate = today();
            let year = BigInt(todayDate.getFullYear()) - BigInt(2024);
            if (year < BigInt(0)) {
              year = BigInt(-1) * year;
            }
            let week = BigInt(weekNumber(todayDate));
            let dayOfWeek = BigInt(todayDate.getDay() + 1);
            let generatedNumber = BigInt(parseInt(resp.data.identifier));
            let barcode = year << (48n - 7n);
            barcode |= week << (48n - 7n - 6n);
            barcode |= dayOfWeek << (48n - 7n - 6n - 3n);
            barcode |= generatedNumber << (48n - 7n - 6n - 3n - 32n);
            let barcodeStr = barcode.toString(16);
            if (barcodeStr.length > 4) {
              let padding = 12 - barcodeStr.length;
              if (padding > 0) {
                if (padding == 1) {
                  barcodeStr = "T" + barcodeStr;
                } else if (padding == 2) {
                  barcodeStr = "LT" + barcodeStr;
                }
              }
              let YearWeekDatOfWeek = barcodeStr.substring(0, 4);
              let generatedNumber = barcodeStr.substring(4);
              for (
                let generatedNumberIndex = 0;
                generatedNumberIndex < generatedNumber.length;
                generatedNumberIndex++
              ) {
                if (generatedNumber[generatedNumberIndex] == "0") {
                  if (generatedNumberIndex + 1 < generatedNumber.length) {
                    generatedNumber = generatedNumber.substring(
                      generatedNumberIndex + 1
                    );
                    generatedNumberIndex--;
                  } else {
                    generatedNumber = "";
                    break;
                  }
                } else {
                  break;
                }
              }
              barcodeStr = (YearWeekDatOfWeek + generatedNumber).toUpperCase();
            }
            return Promise.resolve(barcodeStr);
          } else {
            let todayDate = today();
            let yearStr = todayDate.getFullYear().toString();
            let month = todayDate.getMonth() + 1;
            return Promise.resolve(
              `${yearStr.substring(yearStr.length - 2)}${
                month < 10 ? `0${month}` : month.toString()
              }${
                todayDate.getDate() < 10
                  ? `0${todayDate.getDate()}`
                  : todayDate.getDate().toString()
              }${resp.data.identifier}`
            );
          }
        },
        (error) => {
          return Promise.reject(error);
        }
      );
  }
};

export const decodeBarcodeFormatDateNumber48Bit = (
  barcode: string
): { date: Date; id: string } => {
  if (!barcode) return null;
  if (barcode.length < 4) throw new Error("Invalid barcode");
  let dateExtract = 4;
  if (barcode.startsWith("LT")) {
    dateExtract = dateExtract - 2;
    barcode = barcode.substring(2);
  } else if (barcode.startsWith("T")) {
    dateExtract = dateExtract - 1;
    barcode = barcode.substring(1);
  }
  let datePartStr = barcode.substring(0, dateExtract);
  let idStr =
    barcode.length > dateExtract ? barcode.substring(dateExtract) : "";
  barcode = datePartStr + idStr.padStart(8, "0");
  let barcodeNum = BigInt("0x" + barcode);
  let year = barcodeNum >> (48n - 7n);
  let week =
    ((barcodeNum >> (48n - 7n)) << 6n) ^ (barcodeNum >> (48n - 7n - 6n));
  let dayOfWeek =
    ((barcodeNum >> (48n - 7n - 6n)) << 3n) ^
    (barcodeNum >> (48n - 7n - 6n - 3n));
  let generatedNumber =
    ((barcodeNum >> (48n - 7n - 6n - 3n)) << 32n) ^
    (barcodeNum >> (48n - 7n - 6n - 3n - 32n));

  year = BigInt(2024) + year;
  let finalDate = getDateOfIsoWeek(week, year);
  finalDate.setDate(
    finalDate.getDate() +
      parseInt((dayOfWeek - BigInt(1) - BigInt(finalDate.getDay())).toString())
  );
  return { date: finalDate, id: generatedNumber.toString() };
};

export const decodeEncodedBarcode = (barcode: string): string => {
  try {
    if (!barcode) return barcode;
    if (barcode.indexOf("-") >= 0) return barcode;
    if (barcode.length > 12) return barcode;
    let decodedValue = decodeBarcodeFormatDateNumber48Bit(barcode);
    if (decodedValue?.date)
      return `${formatAsPlainDateForTransfer(decodedValue.date)}-${
        decodedValue.id
      }`;
    return barcode;
  } catch (e) {}
  return barcode;
};
