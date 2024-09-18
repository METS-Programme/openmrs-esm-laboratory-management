import React, { useCallback, useEffect, useState } from "react";
import { OverflowMenuItem, InlineLoading } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { Printer } from "@carbon/react/icons";
import OrderCustomOverflowMenuComponent, {
  OrderCustomOverflowMenuComponentRenderProps,
} from "../ui-components/overflow-menu.component";
import { userHasAccess, useSession } from "@openmrs/esm-framework";
import {
  APP_LABMANAGEMENT_TESTREQUESTS,
  APP_LABMANAGEMENT_TESTRESULTS,
} from "../config/privileges";
import { useLaboratoryConfig } from "../hooks/useLaboratoryConfig";
import { printTransaction } from "./print-actions";

interface PrintTestRequestButtonProps {
  testRequestUuid: string;
  testRequestItemUuid?: string;
  enableResults?: boolean;
}

const PrintTestRequestButton: React.FC<PrintTestRequestButtonProps> = ({
  testRequestUuid,
  testRequestItemUuid,
  enableResults,
}) => {
  const { t } = useTranslation();
  const userSession = useSession();
  const { laboratoryConfig, configReady } = useLaboratoryConfig();
  const [canSeeTestResults, setCanSeeTestResults] = useState(false);
  const [canSeeTestRequest, setCanSeeTestRequest] = useState(false);
  useEffect(() => {
    setCanSeeTestRequest(
      userSession?.user &&
        userHasAccess(APP_LABMANAGEMENT_TESTREQUESTS, userSession.user)
    );
    setCanSeeTestResults(
      (enableResults ?? true) &&
        userSession?.user &&
        userHasAccess(APP_LABMANAGEMENT_TESTRESULTS, userSession.user)
    );
  }, [enableResults, userSession.user]);
  const [isPrinting, setIsPrinting] = useState(false);

  const printAction = useCallback(
    async (action: "Request" | "Results" | "CompletedResults") => {
      setIsPrinting(true);
      printTransaction(
        action,
        testRequestUuid,
        setIsPrinting,
        laboratoryConfig,
        t,
        userSession?.user,
        testRequestItemUuid
      );
    },
    [
      laboratoryConfig,
      t,
      testRequestItemUuid,
      testRequestUuid,
      userSession?.user,
    ]
  );

  const printRequest = useCallback(() => printAction("Request"), [printAction]);
  const printAllResults = useCallback(
    () => printAction("Results"),
    [printAction]
  );
  const printCompletedResults = useCallback(
    () => printAction("CompletedResults"),
    [printAction]
  );

  return configReady ? (
    <OrderCustomOverflowMenuComponent
      hideMenuOnClick={true}
      menuTitle={
        <>
          {isPrinting ? (
            <InlineLoading />
          ) : (
            <Printer size={16} style={{ marginLeft: "0.3rem" }} />
          )}
        </>
      }
      render={({
        onMenuItemClick,
      }: OrderCustomOverflowMenuComponentRenderProps) => {
        return (
          <>
            {!isPrinting && canSeeTestResults && (
              <>
                <OverflowMenuItem
                  itemText={t("laboratoryPrintAllResults", "All Results")}
                  onClick={() => {
                    onMenuItemClick?.();
                    printAllResults();
                  }}
                  style={{
                    maxWidth: "100vw",
                  }}
                />
                <OverflowMenuItem
                  itemText={t(
                    "laboratoryPrintCompletedResults",
                    "Completed Results"
                  )}
                  onClick={() => {
                    onMenuItemClick?.();
                    printCompletedResults();
                  }}
                  style={{
                    maxWidth: "100vw",
                  }}
                />
              </>
            )}
            {!isPrinting && canSeeTestRequest && (
              <OverflowMenuItem
                itemText={t("laboratoryPrintRequest", "Request")}
                onClick={() => {
                  onMenuItemClick?.();
                  printRequest();
                }}
                style={{
                  maxWidth: "100vw",
                }}
              />
            )}
          </>
        );
      }}
    ></OrderCustomOverflowMenuComponent>
  ) : (
    <></>
  );
};
export default PrintTestRequestButton;
