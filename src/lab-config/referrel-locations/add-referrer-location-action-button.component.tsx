import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { launchOverlay } from "../../components/overlay/hook";
import ReferrerLocationForm from "./referrer-location-form.component";
import { ReferrerLocation } from "../../api/types/referrer-location";

const AddReferrerLocationActionButton: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchOverlay(
      t("laboratoryReferrerLocationNewTest", "New Reference Location"),
      <ReferrerLocationForm
        model={{ system: false } as any as ReferrerLocation}
      />
    );
  }, [t]);

  return (
    <Button onClick={handleClick} size="md" kind="primary">
      {t("laboratoryReferrerLocationAddNew", "Add New")}
    </Button>
  );
};

export default AddReferrerLocationActionButton;
