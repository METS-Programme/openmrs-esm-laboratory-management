import { boolean, z } from "zod";

export const LabRequestSchema = z
  .object({
    patientUuid: z.string().max(100),
    requestDate: z.date(),
    careSettingUuid: z.string(),
    urgency: z.string(),
    providerUuid: z.string().max(100),
    clinicalNote: z.string().max(1000).optional(),
    uuid: z.string().nullish(),
    requireRequestReason: z.boolean().nullish().optional(),
    requestReason: z.string().max(500).nullish(),
  })
  .refine(
    ({ requireRequestReason, requestReason }) => {
      return !!!requireRequestReason || Boolean(requestReason);
    },
    {
      message: "Required",
      path: ["requestReason"],
    }
  );

export type LabRequestFormData = z.infer<typeof LabRequestSchema>;
