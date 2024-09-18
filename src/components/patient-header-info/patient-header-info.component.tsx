import React, { useMemo } from "react";
import { ExtensionSlot, Patient, usePatient } from "@openmrs/esm-framework";
import { InlineLoading } from "@carbon/react";

const PatientHeaderInfo = ({
  patientUuid,
  onPatientChange,
}: {
  patientUuid?: string;
  onPatientChange?: (patient: Patient) => void;
}) => {
  const { patient, isLoading } = usePatient(patientUuid);
  const bannerState = useMemo(() => {
    if (patient) {
      onPatientChange?.(patient as any as Patient);
      return {
        patient,
        patientUuid,
        hideActionsOverflow: true,
      };
    }
  }, [onPatientChange, patient, patientUuid]);

  return (
    <>
      {isLoading && (
        <InlineLoading
          iconDescription="Loading"
          description="Loading banner"
          status="active"
        />
      )}
      {patient && (
        <ExtensionSlot name="patient-header-slot" state={bannerState} />
      )}
    </>
  );
};

export default PatientHeaderInfo;
