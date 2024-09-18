import React from "react";
import { Button } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { launchOverlay } from "../../components/overlay/hook";
import ReferrerLocationForm from "./referrer-location-form.component";
import { ReferrerLocation } from "../../api/types/referrer-location";

interface EditReferrerLocationButtonProps {
  data: ReferrerLocation;
  className?: string;
}

const EditReferrerLocationButton: React.FC<EditReferrerLocationButtonProps> = ({
  data,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <Button
      className={className}
      kind="ghost"
      size="md"
      onClick={() => {
        launchOverlay(
          t("laboratoryReferrerLocationEditTest", "Edit Reference Location"),
          <ReferrerLocationForm model={data} />
        );
      }}
      iconDescription={t("laboratoryReferrerLocationEdit", "Edit")}
      title={data?.conceptName ? t("Concept", "Concept") : null}
    >
      {data?.name ?? <>{data?.conceptName}</>}
      {data?.acronym ? ` (${data.acronym})` : ""}
    </Button>
  );
};
export default EditReferrerLocationButton;
