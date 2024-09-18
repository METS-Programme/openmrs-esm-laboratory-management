import React from "react";

import { DefaultWorkspaceProps } from "@openmrs/esm-patient-common-lib";
import LabRequest from "../../lab-request/lab-request.component";

export const LaboratoryWorkspace: React.FC<DefaultWorkspaceProps> = ({
  closeWorkspace,
  promptBeforeClosing,
  patientUuid,
}) => {
  return (
    <LabRequest
      mode="patient"
      patientUuid={patientUuid}
      closeWorkspace={closeWorkspace}
      promptBeforeClosing={promptBeforeClosing}
    />
  );
};

export default LaboratoryWorkspace;
