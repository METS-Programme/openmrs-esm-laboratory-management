import { z } from "zod";

// Stock item details
export const referrerLocationSchema = z
  .object({
    name: z.string().max(250).nullish(),
    useConcept: z.boolean().nullish().optional(),
    acronym: z.string().max(250),
    conceptUuid: z.string().nullish(),
    patientUuid: z.string().nullish(),
    referrerIn: z.boolean(),
    referrerOut: z.boolean(),
    enabled: z.boolean(),
    uuid: z.string().nullish(),
  })
  .refine(
    ({ referrerIn, patientUuid }) => {
      return !Boolean(referrerIn) || Boolean(patientUuid);
    },
    {
      message:
        "Patient is required to be associated with this location if its accessing referrals from location",
      path: ["patientUuid"],
    }
  )
  .refine(
    ({ name, useConcept }) => {
      return useConcept || Boolean(name);
    },
    {
      message: "Name is required",
      path: ["name"],
    }
  )
  .refine(
    ({ conceptUuid, useConcept }) => {
      return !useConcept || Boolean(conceptUuid);
    },
    {
      message: "Concept is required",
      path: ["conceptUuid"],
    }
  );

export type ReferrerLocationFormData = z.infer<typeof referrerLocationSchema>;
