import React, { useEffect, useState } from "react";
import LaboratorySummaryTiles from "./summary-tiles/laboratory-summary-tiles.component";
import LaboratoryOrdersList from "./tests-ordered/laboratory-tabs.component";
import { ILaboratoryNavigationProps } from "./header/laboratory-navigation";
import { userHasAccess, useSession } from "@openmrs/esm-framework";
import { APP_LABMANAGEMENT_DASHBOARD } from "./config/privileges";

interface LaboratoryProps extends ILaboratoryNavigationProps {}

const Laboratory: React.FC<LaboratoryProps> = ({ onPageChanged }) => {
  const [canViewDashboard, setCanViewDashboard] = useState(false);
  const userSession = useSession();
  useEffect(() => {
    setCanViewDashboard(
      userSession?.user &&
        userHasAccess(APP_LABMANAGEMENT_DASHBOARD, userSession.user)
    );
  }, [userSession]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => onPageChanged({ showDateInHeader: true }), []);
  return (
    <>
      <LaboratorySummaryTiles />
      {canViewDashboard && <LaboratoryOrdersList />}
    </>
  );
};

export default Laboratory;
