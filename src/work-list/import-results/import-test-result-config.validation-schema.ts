import { z } from "zod";
import { isNumericValue } from "../../results/result-field";
import { DO_NOT_FILL_VALUE } from "../../api/types/test-result-import-config";

export const TestResultImportConfigSchema = z
  .object({
    id: z.string().optional().nullable().nullish(),
    display: z.string(),
    conceptUuid: z.string().optional().nullable().nullish(),
    isNumeric: z.boolean().nullable().optional(),
    isTextOrNumeric: z.boolean().nullable().optional(),
    isCoded: z.boolean().nullable().optional(),
    isPanel: z.boolean().nullable().optional(),
    value: z.string().optional(),
    allowDecimals: z.boolean().nullable().optional(),
    minValue: z.coerce.number().nullable().optional().nullish(),
    maxValue: z.coerce.number().nullable().optional().nullish(),
    scale: z.coerce.string().nullable().optional().nullish(),
  })
  .partial();

export const TestResultImportConfigSchemaExtend =
  TestResultImportConfigSchema.extend({
    setMembers: z
      .array(
        TestResultImportConfigSchema.extend({
          answers: z
            .array(
              TestResultImportConfigSchema.refine(
                ({ isTextOrNumeric, isCoded, value }) => {
                  if (value == DO_NOT_FILL_VALUE) return true;
                  if (!isTextOrNumeric && !isCoded) return true;
                  if (!value) return false;
                  if (typeof value === "string") {
                    if (value.length == 0) return false;
                    value = value.replace(" ", "");
                  }
                  return value?.length > 0;
                },
                {
                  message: "Required",
                  path: ["value"],
                }
              ).refine(
                ({ isTextOrNumeric, isCoded, value }) => {
                  if (value == DO_NOT_FILL_VALUE) return true;
                  if (!isTextOrNumeric && !isCoded) return true;
                  if (!value) return false;
                  if (typeof value === "string") {
                    if (value.length == 0) return false;
                    value = value.replace(" ", "");
                  }
                  if (
                    !(
                      value.startsWith(">") ||
                      value.startsWith("<") ||
                      value.indexOf("><") >= 0
                    )
                  ) {
                    return true;
                  }
                  if (value.length < 2) return false;
                  if (value.startsWith(">") || value.startsWith("<")) {
                    if (isNumericValue(value.substring(1))) {
                      return true;
                    } else {
                      return false;
                    }
                  } else {
                    let betweenIndex = value.indexOf("><");
                    if (betweenIndex == 0 || betweenIndex == value.length - 1) {
                      return false;
                    }
                    let ranges = value.split("><", 2);
                    if (ranges.length != 2) return false;
                    let allNumeric =
                      isNumericValue(ranges[0]) && isNumericValue(ranges[1]);
                    if (!allNumeric) return false;
                    return Number(ranges[0]) < Number(ranges[1]);
                  }
                },
                {
                  message:
                    "Expression not valid like >1000, <1000 and 1000><2000",
                  path: ["value"],
                }
              )
            )
            .optional()
            .superRefine((val, ctx) => {
              if (val && val.length > 0) {
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
            }),
        })
          .refine(
            ({ isTextOrNumeric, isCoded, value }) => {
              if (value == DO_NOT_FILL_VALUE) return true;
              if (!isTextOrNumeric && !isCoded) return true;
              if (!value) return false;
              if (typeof value === "string") {
                if (value.length == 0) return false;
                value = value.replace(" ", "");
              }
              return value?.length > 0;
            },
            {
              message: "Required",
              path: ["value"],
            }
          )
          .refine(
            ({ isNumeric, scale, value }) => {
              if (value == DO_NOT_FILL_VALUE) return true;
              if (!isNumeric) return true;
              if (!scale) return false;
              if (typeof scale === "string") {
                if (scale.length == 0) return false;
                scale = scale.replace(" ", "X");
              }
              return !Number.isNaN(Number(scale));
            },
            {
              message: "Number required",
              path: ["scale"],
            }
          )
      )
      .optional()
      .superRefine((val, ctx) => {
        if (val && val.length > 0) {
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
      }),
    answers: z
      .array(
        TestResultImportConfigSchema.refine(
          ({ isTextOrNumeric, isCoded, value }) => {
            if (!isTextOrNumeric && !isCoded) return true;
            if (!value) return false;
            if (typeof value === "string") {
              if (value.length == 0) return false;
              value = value.replace(" ", "");
            }
            return value?.length > 0;
          },
          {
            message: "Required",
            path: ["value"],
          }
        ).refine(
          ({ isTextOrNumeric, isCoded, value }) => {
            if (!isTextOrNumeric && !isCoded) return true;
            if (!value) return false;
            if (typeof value === "string") {
              if (value.length == 0) return false;
              value = value.replace(" ", "");
            }
            if (
              !(
                value.startsWith(">") ||
                value.startsWith("<") ||
                value.indexOf("><") >= 0
              )
            ) {
              return true;
            }
            if (value.length < 2) return false;
            if (value.startsWith(">") || value.startsWith("<")) {
              if (isNumericValue(value.substring(1))) {
                return true;
              } else {
                return false;
              }
            } else {
              let betweenIndex = value.indexOf("><");
              if (betweenIndex == 0 || betweenIndex == value.length - 1) {
                return false;
              }
              let ranges = value.split("><", 2);
              if (ranges.length != 2) return false;
              let allNumeric =
                isNumericValue(ranges[0]) && isNumericValue(ranges[1]);
              if (!allNumeric) return false;
              return Number(ranges[0]) < Number(ranges[1]);
            }
          },
          {
            message: "Expression not valid like >1000, <1000 and 1000><2000",
            path: ["value"],
          }
        )
      )
      .optional()
      .superRefine((val, ctx) => {
        if (val && val.length > 0) {
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
      }),
  })
    .refine(
      ({ isCoded, isTextOrNumeric, value }) => {
        if (value == DO_NOT_FILL_VALUE) return true;
        if (!isTextOrNumeric && !isCoded) return true;
        if (!value) return false;
        if (typeof value === "string") {
          if (value.length == 0) return false;
          value = value.replace(" ", "");
        }
        return value?.length > 0;
      },
      {
        message: "Required",
        path: ["value"],
      }
    )
    .refine(
      ({ isNumeric, scale, value }) => {
        if (value == DO_NOT_FILL_VALUE) return true;
        if (!isNumeric) return true;
        if (!scale) return false;
        if (typeof scale === "string") {
          if (scale.length == 0) return false;
          scale = scale.replace(" ", "X");
        }
        return !Number.isNaN(Number(scale));
      },
      {
        message: "Number required",
        path: ["scale"],
      }
    );

export const TestResultImportConfigFieldsSchema = z.object({
  fields: z.array(TestResultImportConfigSchemaExtend).nonempty(),
  sampleId: z.string(),
});
export type TestResultImportConfigFormData = z.infer<
  typeof TestResultImportConfigFieldsSchema
>;
export type TestResultImportConfigFieldsFormData = z.infer<
  typeof TestResultImportConfigSchemaExtend
>;
