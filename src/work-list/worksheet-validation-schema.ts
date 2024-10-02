import { z } from "zod";
import { otherUser } from "../api/users.resource";

export const WorksheetItemSchema = z.object({
  testRequestItemSampleUuid: z.string(),
});

export const WorksheetSchema = z
  .object({
    uuid: z.string().nullish(),
    atLocationUuid: z.string(),
    worksheetDate: z.date(),
    testUuid: z.string().optional().nullish(),
    diagnosisTypeUuid: z.string().optional().nullish(),
    responsiblePersonUuid: z.string().optional().nullish(),
    responsiblePersonOther: z.string().max(150).optional().nullish(),
    remarks: z.string().max(255).optional().nullish(),
    worksheetItems: z.array(WorksheetItemSchema).nonempty("Required"),
  })
  .refine(
    ({ responsiblePersonUuid }) => {
      return Boolean(responsiblePersonUuid);
    },
    {
      message: "Required",
      path: ["responsiblePersonUuid"],
    }
  )
  .refine(
    ({ responsiblePersonUuid, responsiblePersonOther }) => {
      return (
        responsiblePersonUuid !== otherUser.uuid ||
        Boolean(responsiblePersonOther)
      );
    },
    {
      message: "Required",
      path: ["responsiblePersonOther"],
    }
  );
export type WorksheetFormData = z.infer<typeof WorksheetSchema>;
