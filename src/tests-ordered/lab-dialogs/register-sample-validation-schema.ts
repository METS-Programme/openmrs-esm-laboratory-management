import { z } from "zod";

export const SampleSchema = z
  .object({
    uuid: z.string().nullish(),
    sampleTypeUuid: z.string(),
    providedRef: z.string().max(255).optional().nullish(),
    confirmProvidedRef: z.string().max(255).optional().nullish(),
    accessionNumber: z.string().max(255),
    tests: z.array(z.string()).nonempty("Required"),
    containerTypeUuid: z.string().optional().nullish(),
    containerCount: z.coerce.number().int("Integer").optional().nullish(),
    specifyVolume: z.boolean(),
    volume: z.coerce.number().optional().nullish(),
    volumeUnitUuid: z.string().optional().nullish(),
    referredOut: z.boolean(),
    referralToFacilityUuid: z.string().optional().nullish(),
    archiveSample: z.boolean(),
    storageUuid: z.string().nullable().optional(),
    storageUnitUuid: z.string().optional().nullish(),
  })
  .refine(
    ({ containerCount, containerTypeUuid }) => {
      return Boolean(containerCount) || Boolean(!containerTypeUuid);
    },
    {
      message: "Required",
      path: ["containerCount"],
    }
  )
  .refine(
    ({ containerCount, containerTypeUuid }) => {
      return Boolean(containerTypeUuid) || Boolean(!containerCount);
    },
    {
      message: "Required",
      path: ["containerTypeUuid"],
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
    ({ referredOut, referralToFacilityUuid }) => {
      return Boolean(referralToFacilityUuid) || Boolean(!referredOut);
    },
    {
      message: "Required",
      path: ["referralToFacilityUuid"],
    }
  )
  .refine(
    ({ referredOut, providedRef, confirmProvidedRef }) => {
      return (
        Boolean(!referredOut) ||
        Boolean(!confirmProvidedRef) ||
        Boolean(providedRef)
      );
    },
    {
      message: "Required",
      path: ["providedRef"],
    }
  )
  .refine(
    ({ referredOut, providedRef, confirmProvidedRef }) => {
      return (
        Boolean(!referredOut) ||
        Boolean(!providedRef) ||
        Boolean(confirmProvidedRef)
      );
    },
    {
      message: "Required",
      path: ["confirmProvidedRef"],
    }
  )
  .refine(
    ({ referredOut, providedRef, confirmProvidedRef }) => {
      return (
        Boolean(!referredOut) ||
        (Boolean(!providedRef) && Boolean(!confirmProvidedRef)) ||
        (providedRef?.length > 0 &&
          confirmProvidedRef?.length > 0 &&
          providedRef == confirmProvidedRef)
      );
    },
    {
      message: "Additional reference must be similar",
      path: ["confirmProvidedRef"],
    }
  )
  .refine(
    ({ archiveSample, storageUuid }) => {
      return (
        !Boolean(archiveSample) ||
        Boolean(storageUuid && storageUuid.trim().length > 0)
      );
    },
    {
      message: "Required",
      path: ["storageUuid"],
    }
  )
  .refine(
    ({ archiveSample, storageUnitUuid }) => {
      return (
        !Boolean(archiveSample) ||
        Boolean(storageUnitUuid && storageUnitUuid.trim().length > 0)
      );
    },
    {
      message: "Required",
      path: ["storageUnitUuid"],
    }
  );

export type SampleFormData = z.infer<typeof SampleSchema>;
