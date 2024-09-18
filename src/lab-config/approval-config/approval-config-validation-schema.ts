import { z } from "zod";

// Stock item details
export const approvalConfigSchema = z.object({
  approvalTitle: z.string().max(100),
  privilege: z.string().max(255),
  pendingStatus: z.string().max(100),
  returnedStatus: z.string().max(100),
  rejectedStatus: z.string().max(100),
  approvedStatus: z.string().max(100),
  uuid: z.string().nullish(),
});

export type ApprovalConfigFormData = z.infer<typeof approvalConfigSchema>;
