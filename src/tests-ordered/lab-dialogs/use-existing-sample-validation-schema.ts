import { z } from "zod";

export const ExistingSampleSchema = z.object({
  sampleUuid: z.string().nullish(),
  tests: z.array(z.string()).nonempty("Required"),
});

export type ExistingSampleFormData = z.infer<typeof ExistingSampleSchema>;
