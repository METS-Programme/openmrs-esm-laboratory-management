import { boolean, z } from "zod";
import { DiagonisticCenterTests } from "../api/types/sample";
import { UrgencyTypes } from "../api/types/urgency";

export const SampleSchema = z
  .object({
    uuid: z.string().nullish(),
    sampleTypeUuid: z.string().optional(),
    externalRef: z.string().max(100).optional(),
    accessionNumber: z.string().max(255).optional(),
    tests: z.any().optional(),
    archiveSample: z.boolean().nullable().optional(),
    storageUuid: z.string().nullable().optional(),
    storageUnitUuid: z.string().optional().nullish(),
  })
  .refine(
    ({
      sampleTypeUuid,
      externalRef,
      accessionNumber,
      tests,
      archiveSample,
    }) => {
      return (
        Boolean(sampleTypeUuid) ||
        Boolean(
          !externalRef &&
            !accessionNumber &&
            !Boolean(
              tests &&
                Object.entries(tests as any as DiagonisticCenterTests).some(
                  ([k, v]) => v?.tests?.length > 0
                )
            ) &&
            !archiveSample
        )
      );
    },
    {
      message: "Required",
      path: ["sampleTypeUuid"],
    }
  )
  .refine(
    ({
      sampleTypeUuid,
      externalRef,
      accessionNumber,
      tests,
      archiveSample,
    }) => {
      return (
        Boolean(externalRef) ||
        Boolean(
          !sampleTypeUuid &&
            !accessionNumber &&
            !Boolean(
              tests &&
                Object.entries(tests as any as DiagonisticCenterTests).some(
                  ([k, v]) => v?.tests?.length > 0
                )
            ) &&
            !archiveSample
        )
      );
    },
    {
      message: "Required",
      path: ["externalRef"],
    }
  )
  .refine(
    ({
      sampleTypeUuid,
      externalRef,
      accessionNumber,
      tests,
      archiveSample,
    }) => {
      return (
        Boolean(accessionNumber) ||
        Boolean(
          !sampleTypeUuid &&
            !externalRef &&
            !Boolean(
              tests &&
                Object.entries(tests as any as DiagonisticCenterTests).some(
                  ([k, v]) => v?.tests?.length > 0
                )
            ) &&
            !archiveSample
        )
      );
    },
    {
      message: "Required",
      path: ["accessionNumber"],
    }
  )
  .refine(
    ({
      sampleTypeUuid,
      externalRef,
      accessionNumber,
      tests,
      archiveSample,
    }) => {
      return (
        Boolean(
          tests &&
            Object.entries(tests as any as DiagonisticCenterTests).some(
              ([k, v]) => v?.tests?.length > 0
            )
        ) ||
        Boolean(
          !sampleTypeUuid && !externalRef && !accessionNumber && !archiveSample
        )
      );
    },
    {
      message: "At least one test is required",
      path: ["tests"],
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

// Stock item details
export const LabRequestSchema = z
  .object({
    referralFromFacilityUuid: z.string(),
    requestDate: z.date(),
    urgency: z.enum(UrgencyTypes),
    referralInExternalRef: z.string().max(50).optional(),
    clinicalNote: z.string().max(1000).optional(),
    uuid: z.string().nullish(),
    samples: z.array(SampleSchema).nonempty("Required"),
  })
  .refine(
    ({ samples }) => {
      return (
        samples?.length > 0 &&
        samples.some((p) =>
          Boolean(
            p.accessionNumber ||
              p.externalRef ||
              p.sampleTypeUuid ||
              Boolean(
                p.tests &&
                  Object.entries(p.tests as any as DiagonisticCenterTests).some(
                    ([k, v]) => v?.tests?.length > 0
                  )
              )
          )
        )
      );
    },
    {
      message: "At least one sample is required",
      path: ["samples"],
    }
  );

export type LabRequestFormData = z.infer<typeof LabRequestSchema>;
