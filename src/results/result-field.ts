import { Concept } from "../api/types/concept/concept";
import { WorksheetItem } from "../api/types/worksheet-item";

export interface ResultField {
  id: string;
  worksheetItem?: WorksheetItem;
  worksheetItemUuid?: string;
  remarks?: string;
  testResultUuid?: string;
  orderUuid: string;
  conceptUuid: string;
  display?: string;
  isTextOrNumeric: boolean;
  isCoded: boolean;
  isPanel: boolean;
  concept: Concept;
  value?: string;
  setMembers?: Array<ResultField> | null;
  isNumeric: boolean;
  minValue?: number;
  maxValue?: number;
  allowDecimals: boolean;
  scale?: string;
  answers?: Array<ResultField> | null;
  resultFilled?: boolean;
}

export const isCoded = (concept) =>
  Boolean(concept.datatype?.display === "Coded");
export const isPanel = (concept) => Boolean(concept.setMembers?.length > 0);

export const isTextOrNumeric = (concept) =>
  Boolean(
    concept.datatype?.display === "Text" ||
      concept.datatype?.display === "Numeric" ||
      (!isCoded(concept) && !isPanel(concept))
  );

export const isNumericConcept = (concept) =>
  Boolean(concept.datatype?.display === "Numeric");

export const isNumericValue = (value: any) => {
  if (value == null || typeof value == "undefined") return false;
  let numValue = Number(value);
  return isFinite(numValue) && !Number.isNaN(numValue);
};

export const printValueRange = (concept: any, defaultValue: string = "") => {
  if (concept?.datatype?.display === "Numeric") {
    let maxVal = Math.max(
      ...[concept?.hiAbsolute, concept?.hiCritical, concept?.hiNormal]
        .filter((p) => isNumericValue(p))
        .map((p) => Number(p))
    );
    let minVal = Math.min(
      ...[concept?.lowAbsolute, concept?.lowCritical, concept?.lowNormal]
        .filter((p) => isNumericValue(p))
        .map((p) => Number(p))
    );

    if (isNumericValue(minVal) && isNumericValue(maxVal)) {
      return ` (${minVal} - ${maxVal}${
        concept?.units ? ` ${concept?.units}` : ""
      })`;
    }

    if (isNumericValue(minVal)) {
      return ` (${minVal} - * ${concept?.units ? ` ${concept?.units}` : ""})`;
    }

    if (isNumericValue(maxVal)) {
      return ` ( * - ${maxVal}${concept?.units ? ` ${concept?.units}` : ""})`;
    }

    return defaultValue;
  }
  return defaultValue;
};
