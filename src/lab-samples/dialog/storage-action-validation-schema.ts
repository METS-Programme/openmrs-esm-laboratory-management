import { boolean, z } from "zod";
import { otherUser } from "../../api/users.resource";

export const StorageActionSchema = z
  .object({
    actionDate: z.date(),
    storageUnitRequired: z.boolean().optional(),
    storageUuid: z.string().nullable().optional(),
    storageUnitUuid: z.string().nullable().optional(),
    thawCycles: z.coerce.number().int("Integer").optional().nullish(),
    specifyVolume: z.boolean(),
    volume: z.coerce.number().optional().nullish(),
    volumeUnitUuid: z.string().optional().nullish(),
    responsiblePersonUuid: z.string().optional().nullish(),
    responsiblePersonOther: z.string().max(150).optional().nullish(),
    remarksRequired: z.boolean().optional(),
    remarks: z.string().max(500).optional(),
  })
  .refine(
    ({ storageUnitRequired, storageUuid }) => {
      return (
        !Boolean(storageUnitRequired) ||
        Boolean(storageUuid && storageUuid.trim().length > 0)
      );
    },
    {
      message: "Required",
      path: ["storageUuid"],
    }
  )
  .refine(
    ({ storageUnitRequired, storageUnitUuid }) => {
      return (
        !Boolean(storageUnitRequired) ||
        Boolean(storageUnitUuid && storageUnitUuid.trim().length > 0)
      );
    },
    {
      message: "Required",
      path: ["storageUnitUuid"],
    }
  )
  .refine(
    ({ volume, volumeUnitUuid }) => {
      return Boolean(volume) || Boolean(!volumeUnitUuid);
    },
    {
      message: "Required",
      path: ["volume"],
    }
  )
  .refine(
    ({ volume, volumeUnitUuid }) => {
      return Boolean(volumeUnitUuid) || Boolean(!volume);
    },
    {
      message: "Required",
      path: ["volumeUnitUuid"],
    }
  )
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
  )
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

export type StorageActionFormData = z.infer<typeof StorageActionSchema>;
