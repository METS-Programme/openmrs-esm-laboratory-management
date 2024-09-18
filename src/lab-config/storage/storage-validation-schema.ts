import { z } from "zod";

// Stock item details
export const storageSchema = z
  .object({
    atLocationUuid: z.string(),
    name: z.string().max(100),
    description: z.string().max(500).optional().nullable(),
    capacity: z.coerce.number().int("Integer"),
    active: z.boolean(),
    uuid: z.string().nullish(),
  })
  .refine(
    ({ capacity }) => {
      return Boolean(capacity && capacity > 0);
    },
    {
      message: "Required",
      path: ["capacity"],
    }
  );

export type StorageFormData = z.infer<typeof storageSchema>;
