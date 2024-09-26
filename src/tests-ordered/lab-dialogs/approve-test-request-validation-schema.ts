import { z } from "zod";

export const ApproveTestSchema = z
  .object({
    remarksRequired: z.boolean().optional(),
    remarks: z.string().max(500).optional(),
  })
  .refine(
    ({ remarksRequired, remarks }) => {
      return (
        !Boolean(remarksRequired) ||
        Boolean(remarks && remarks.trim().length > 0)
      );
    },
    {
      message: "Required",
      path: ["remarks"],
    }
  );

export type ApproveTestFormData = z.infer<typeof ApproveTestSchema>;
