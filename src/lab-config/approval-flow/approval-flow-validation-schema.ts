import { z } from "zod";

// Stock item details
export const approvalFlowSchema = z.object({
  name: z.string().max(100),
  systemName: z.string().max(50),
  levelOneUuid: z.string(),
  levelOneAllowOwner: z.boolean(),
  levelTwoUuid: z.string().nullish(),
  levelTwoAllowOwner: z.boolean(),
  levelThreeUuid: z.string().nullish(),
  levelThreeAllowOwner: z.boolean(),
  levelFourUuid: z.string().nullish(),
  levelFourAllowOwner: z.boolean(),
  levelTwoAllowPrevious: z.boolean(),
  levelThreeAllowPrevious: z.boolean(),
  levelFourAllowPrevious: z.boolean(),
  uuid: z.string().nullish(),
});

export type ApprovalFlowFormData = z.infer<typeof approvalFlowSchema>;
