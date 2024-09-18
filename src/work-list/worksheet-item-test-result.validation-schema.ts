import { z } from "zod";

export const WorksheetItemTestResultObservationSchema = z
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
    minValue: z.coerce.number().nullable().optional().nullish(),
    maxValue: z.coerce.number().nullable().optional().nullish(),
    resultFilled: z.boolean().nullable().optional(),
  })
  .partial();

export const WorksheetItemTestResultObservationSchemaExtend =
  WorksheetItemTestResultObservationSchema.extend({
    remarks: z
      .string()
      .max(1000, "1000 char(s) max")
      .optional()
      .nullable()
      .nullish(),
    setMembers: z
      .array(
        WorksheetItemTestResultObservationSchema.refine(
          ({ isNumeric, value }) => {
            if (!isNumeric) return true;
            if (!value) return true;
            if (typeof value === "string") {
              if (value.length == 0) return true;
              value = value.replace(" ", "X");
            }
            return !Number.isNaN(Number(value));
          },
          {
            message: "Number required",
            path: ["value"],
          }
        )
          .refine(
            ({ isNumeric, value, allowDecimals }) => {
              if (!isNumeric) return true;
              if (!value) return true;
              if (typeof value === "string") {
                if (value.length == 0) return true;
                value = value.replace(" ", "X");
              }
              let number = Number(value);
              if (Number.isNaN(number)) return true;
              allowDecimals = allowDecimals ?? true;
              if (allowDecimals) return true;
              return Math.ceil(number) == number;
            },
            {
              message: "Decimals not allowed",
              path: ["value"],
            }
          )
          .refine(
            ({ isNumeric, value, minValue }) => {
              if (!isNumeric) return true;
              if (!minValue) return true;
              if (!value) return true;
              if (typeof value === "string") {
                if (value.length == 0) return true;
                value = value.replace(" ", "X");
              }
              let number = Number(value);
              return number >= Number(minValue);
            },
            {
              message: "Lower than supported minimum value",
              path: ["value"],
            }
          )
          .refine(
            ({ isNumeric, value, maxValue }) => {
              if (!isNumeric) return true;
              if (!maxValue) return true;
              if (!value) return true;
              if (typeof value === "string") {
                if (value.length == 0) return true;
                value = value.replace(" ", "X");
              }
              let number = Number(value);
              return number <= Number(maxValue);
            },
            {
              message: "Higher than supported maximum value",
              path: ["value"],
            }
          )
      )
      .optional()
      .superRefine((val, ctx) => {
        if (val && val.length > 0) {
          let aSetMemberHasValue = val?.find((p) => p.value);
          if (aSetMemberHasValue) {
            for (let valIndex = 0; valIndex < val.length; valIndex++) {
              if (!val[valIndex].value) {
                ctx.addIssue({
                  code: "custom",
                  path: [valIndex, `value`],
                  message: "Required",
                });
              }
            }
          }
        }
      }),
  })
    .refine(
      ({ isNumeric, value }) => {
        if (!isNumeric) return true;
        if (!value) return true;
        if (typeof value === "string") {
          if (value.length == 0) return true;
          value = value.replace(" ", "X");
        }
        return !Number.isNaN(Number(value));
      },
      {
        message: "Number required",
        path: ["value"],
      }
    )
    .refine(
      ({ isNumeric, value, allowDecimals }) => {
        if (!isNumeric) return true;
        if (!value) return true;
        if (typeof value === "string") {
          if (value.length == 0) return true;
          value = value.replace(" ", "X");
        }
        let number = Number(value);
        if (Number.isNaN(number)) return true;
        allowDecimals = allowDecimals ?? true;
        if (allowDecimals) return true;
        return Math.ceil(number) == number;
      },
      {
        message: "Decimals not allowed",
        path: ["value"],
      }
    )
    .refine(
      ({ isNumeric, value, minValue }) => {
        if (!isNumeric) return true;
        if (!minValue) return true;
        if (!value) return true;
        if (typeof value === "string") {
          if (value.length == 0) return true;
          value = value.replace(" ", "X");
        }
        let number = Number(value);
        return number >= Number(minValue);
      },
      {
        message: "Lower than supported minimum value",
        path: ["value"],
      }
    )
    .refine(
      ({ isNumeric, value, maxValue }) => {
        if (!isNumeric) return true;
        if (!maxValue) return true;
        if (!value) return true;
        if (typeof value === "string") {
          if (value.length == 0) return true;
          value = value.replace(" ", "X");
        }
        let number = Number(value);
        return number <= Number(maxValue);
      },
      {
        message: "Higher than supported maximum value",
        path: ["value"],
      }
    )
    .refine(
      ({ isPanel, isCoded, isTextOrNumeric, setMembers, value }) => {
        if (!isPanel) return true;
        if (!setMembers) return false;
        let setMember =
          setMembers.find((p) => !!p.value) ||
          ((isTextOrNumeric || isCoded) && value);

        if (!setMember) return true;
        return (
          !setMembers.some((p) => !Boolean(p.value)) &&
          ((!isTextOrNumeric && !isCoded) || Boolean(value))
        );
      },
      {
        message: "All fields required if any is set",
        path: ["setMembers"],
      }
    );

export const WorksheetItemTestResultsSchema = z.object({
  worksheetItems: z.array(WorksheetItemTestResultObservationSchemaExtend),
});
export type WorksheetItemTestResultsFormData = z.infer<
  typeof WorksheetItemTestResultsSchema
>;

export const WorksheetItemTestResultObservationRequiredSchemaExtend =
  WorksheetItemTestResultObservationSchemaExtend.refine(
    ({ isPanel, isCoded, isTextOrNumeric, setMembers, value }) => {
      if (!isPanel) return true;
      if (!setMembers) return false;
      let setMember =
        setMembers.find((p) => !!p.value) ||
        ((isTextOrNumeric || isCoded) && value);

      if (!setMember) return true;
      return (
        setMembers.some((p) => !Boolean(p.value)) &&
        ((!isTextOrNumeric && !isCoded) || Boolean(value))
      );
    },
    {
      message: "All fields required if any is set",
      path: ["setMembers"],
    }
  );

export type WorksheetItemTestResultObservationFormData = z.infer<
  typeof WorksheetItemTestResultObservationSchemaExtend
>;
