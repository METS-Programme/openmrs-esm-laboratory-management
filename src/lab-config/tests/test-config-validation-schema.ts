import { z } from "zod";

// Stock item details
export const testConfigSchema = z
  .object({
    testUuid: z.string(),
    testGroupUuid: z.string(),
    requireApproval: z.boolean(),
    approvalFlowUuid: z.string().nullish(),
    enabled: z.boolean(),
    uuid: z.string().nullish(),
  })
  .refine(
    ({ uuid, testUuid }) => {
      return uuid?.length > 0 ? Boolean(testUuid) : true;
    },
    {
      message: "Test required",
      path: ["testUuid"],
    }
  )
  .refine(
    ({ requireApproval, approvalFlowUuid }) => {
      return requireApproval ? Boolean(approvalFlowUuid) : true;
    },
    {
      message: "Approval flow required",
      path: ["approvalFlowUuid"],
    }
  );

export type TestConfigFormData = z.infer<typeof testConfigSchema>;
