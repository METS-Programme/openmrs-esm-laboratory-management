import { z } from "zod";

export const ReportTestResultObservationSchema = z
  .object({
    id: z.string().optional().nullable().nullish(),
    conceptUuid: z.string().optional().nullable().nullish(),
    worksheetItemUuid: z.string().optional().nullable().nullish(),
    testResultUuid: z.string().nullable().optional(),
    orderUuid: z.string().optional().nullable().nullish(),
    isNumeric: z.boolean().nullable().optional(),
    isTextOrNumeric: z.boolean().nullable().optional(),
    isCoded: z.boolean().nullable().optional(),
    isPanel: z.boolean().nullable().optional(),
    value: z.coerce.string().nullish().optional(),
    allowDecimals: z.boolean().nullable().optional(),
    minValue: z.coerce.string().nullable().optional().nullish(),
    maxValue: z.coerce.string().nullable().optional().nullish(),
  })
  .partial();

export const ReportTestResultObservationSchemaExtend =
  ReportTestResultObservationSchema.extend({
    remarks: z
      .string()
      .max(1000, "1000 char(s) max")
      .optional()
      .nullable()
      .nullish(),
    setMembers: z
      .array(
        ReportTestResultObservationSchema.refine(
          ({ isNumeric, minValue }) => {
            if (!isNumeric) return true;
            if (!minValue) return true;
            if (typeof minValue === "string") {
              if (minValue.length == 0) return true;
              minValue = minValue.replace(" ", "X");
            }
            return !Number.isNaN(Number(minValue));
          },
          {
            message: "Number required",
            path: ["minValue"],
          }
        )
          .refine(
            ({ isNumeric, maxValue }) => {
              if (!isNumeric) return true;
              if (!maxValue) return true;
              if (typeof maxValue === "string") {
                if (maxValue.length == 0) return true;
                maxValue = maxValue.replace(" ", "X");
              }
              return !Number.isNaN(Number(maxValue));
            },
            {
              message: "Number required",
              path: ["maxValue"],
            }
          )
          .refine(
            ({ isNumeric, minValue, allowDecimals }) => {
              if (!isNumeric) return true;
              if (!minValue) return true;
              if (typeof minValue === "string") {
                if (minValue.length == 0) return true;
                minValue = minValue.replace(" ", "X");
              }
              let number = Number(minValue);
              if (Number.isNaN(number)) return true;
              allowDecimals = allowDecimals ?? true;
              if (allowDecimals) return true;
              return Math.ceil(number) == number;
            },
            {
              message: "Decimals not allowed",
              path: ["minValue"],
            }
          )
          .refine(
            ({ isNumeric, maxValue, allowDecimals }) => {
              if (!isNumeric) return true;
              if (!maxValue) return true;
              if (typeof maxValue === "string") {
                if (maxValue.length == 0) return true;
                maxValue = maxValue.replace(" ", "X");
              }
              let number = Number(maxValue);
              if (Number.isNaN(number)) return true;
              allowDecimals = allowDecimals ?? true;
              if (allowDecimals) return true;
              return Math.ceil(number) == number;
            },
            {
              message: "Decimals not allowed",
              path: ["maxValue"],
            }
          )
      )
      .optional(),
  })
    .refine(
      ({ isNumeric, minValue }) => {
        if (!isNumeric) return true;
        if (!minValue) return true;
        if (typeof minValue === "string") {
          if (minValue.length == 0) return true;
          minValue = minValue.replace(" ", "X");
        }
        return !Number.isNaN(Number(minValue));
      },
      {
        message: "Number required",
        path: ["minValue"],
      }
    )
    .refine(
      ({ isNumeric, maxValue }) => {
        if (!isNumeric) return true;
        if (!maxValue) return true;
        if (typeof maxValue === "string") {
          if (maxValue.length == 0) return true;
          maxValue = maxValue.replace(" ", "X");
        }
        return !Number.isNaN(Number(maxValue));
      },
      {
        message: "Number required",
        path: ["maxValue"],
      }
    )
    .refine(
      ({ isNumeric, minValue, allowDecimals }) => {
        if (!isNumeric) return true;
        if (!minValue) return true;
        if (typeof minValue === "string") {
          if (minValue.length == 0) return true;
          minValue = minValue.replace(" ", "X");
        }
        let number = Number(minValue);
        if (Number.isNaN(number)) return true;
        allowDecimals = allowDecimals ?? true;
        if (allowDecimals) return true;
        return Math.ceil(number) == number;
      },
      {
        message: "Decimals not allowed",
        path: ["minValue"],
      }
    )
    .refine(
      ({ isNumeric, maxValue, allowDecimals }) => {
        if (!isNumeric) return true;
        if (!maxValue) return true;
        if (typeof maxValue === "string") {
          if (maxValue.length == 0) return true;
          maxValue = maxValue.replace(" ", "X");
        }
        let number = Number(maxValue);
        if (Number.isNaN(number)) return true;
        allowDecimals = allowDecimals ?? true;
        if (allowDecimals) return true;
        return Math.ceil(number) == number;
      },
      {
        message: "Decimals not allowed",
        path: ["maxValue"],
      }
    );

export const ReportTestResultsSchema = z.object({
  worksheetItems: z.array(ReportTestResultObservationSchemaExtend),
});
export type ReportTestResultsFormData = z.infer<typeof ReportTestResultsSchema>;

export type ReportTestResultObservationFormData = z.infer<
  typeof ReportTestResultObservationSchema
>;

export const reportSchema = z
  .object({
    reportName: z.string(),
    reportSystemName: z.string(),

    dateRequired: z.boolean(),
    date: z.coerce.date().optional(),

    startDateRequired: z.boolean(),
    startDate: z.coerce.date().optional(),

    endDateRequired: z.boolean(),
    endDate: z.coerce.date().optional(),

    locationRequired: z.boolean(),
    locationUuid: z.string().optional(),
    locationName: z.string().optional(),

    patientRequired: z.boolean(),
    patientUuid: z.string().optional(),
    patientName: z.string().optional(),

    referralLocationRequired: z.boolean(),
    referralLocationUuid: z.string().optional(),
    referralLocationName: z.string().optional(),

    limitRequired: z.boolean(),
    limit: z.string().optional(),

    diagnosticLocationRequired: z.boolean(),
    diagnosticLocationUuid: z.string().optional(),
    diagnosticLocationName: z.string().optional(),

    testTypeRequired: z.boolean(),
    testTypeUuid: z.string().optional(),
    testTypeName: z.string().optional(),

    testOutcomeRequired: z.boolean(),
    testOutcomes: z.array(ReportTestResultObservationSchemaExtend).optional(),
    testOutcomeName: z.string().optional(),

    testerRequired: z.boolean(),
    testerUuid: z.string().optional(),
    testerName: z.string().optional(),

    testApproverRequired: z.boolean(),
    testApproverUuid: z.string().optional(),
    testApproverName: z.string().optional(),

    referenceNumberRequired: z.boolean(),
    referenceNumber: z.string().optional(),
  })
  .refine(
    ({ dateRequired, date }) => {
      return !dateRequired || Boolean(date);
    },
    {
      message: "Required",
      path: ["date"],
    }
  )
  .refine(
    ({ startDateRequired, startDate }) => {
      return !startDateRequired || Boolean(startDate);
    },
    {
      message: "Required",
      path: ["startDate"],
    }
  )
  .refine(
    ({ endDateRequired, endDate }) => {
      return !endDateRequired || Boolean(endDate);
    },
    {
      message: "Required",
      path: ["endDate"],
    }
  )
  .refine(
    ({ locationRequired, locationUuid }) => {
      return !locationRequired || Boolean(locationUuid);
    },
    {
      message: "Required",
      path: ["locationUuid"],
    }
  )
  .refine(
    ({ patientRequired, patientUuid }) => {
      return !patientRequired || Boolean(patientUuid);
    },
    {
      message: "Required",
      path: ["patientUuid"],
    }
  )
  .refine(
    ({ referralLocationRequired, referralLocationUuid }) => {
      return !referralLocationRequired || Boolean(referralLocationUuid);
    },
    {
      message: "Required",
      path: ["referralLocationUuid"],
    }
  )
  .refine(
    ({ limitRequired, limit }) => {
      return !limitRequired || Boolean(limit);
    },
    {
      message: "Required",
      path: ["limit"],
    }
  )
  .refine(
    ({ diagnosticLocationRequired, diagnosticLocationUuid }) => {
      return !diagnosticLocationRequired || Boolean(diagnosticLocationUuid);
    },
    {
      message: "Required",
      path: ["diagnosticLocationUuid"],
    }
  )
  .refine(
    ({ testTypeRequired, testTypeUuid }) => {
      return !testTypeRequired || Boolean(testTypeUuid);
    },
    {
      message: "Required",
      path: ["testTypeUuid"],
    }
  )
  .refine(
    ({ testOutcomes, testOutcomeRequired }) => {
      return (
        !testOutcomeRequired ||
        testOutcomes?.some((p) => {
          if (!p.isPanel) return true;
          if (!p.setMembers) return false;
          let setMember =
            p.setMembers.find((p) => !!p.value) ||
            ((p.isTextOrNumeric || p.isCoded) && p.value);

          if (!setMember) return true;
          return (
            !p.setMembers.some((x) => !Boolean(x.value)) &&
            ((!p.isTextOrNumeric && !p.isCoded) || Boolean(p.value))
          );
        })
      );
    },
    {
      message: "Required",
      path: ["testOutcomes"],
    }
  )
  .refine(
    ({ testerRequired, testerUuid }) => {
      return !testerRequired || Boolean(testerUuid);
    },
    {
      message: "Required",
      path: ["testerUuid"],
    }
  )
  .refine(
    ({ testApproverRequired, testApproverUuid }) => {
      return !testApproverRequired || Boolean(testApproverUuid);
    },
    {
      message: "Required",
      path: ["testApproverUuid"],
    }
  )
  .refine(
    ({ referenceNumberRequired, referenceNumber }) => {
      return !referenceNumberRequired || Boolean(referenceNumber?.trim());
    },
    {
      message: "Required",
      path: ["referenceNumber"],
    }
  );

export type LabReportSchema = z.infer<typeof reportSchema>;
