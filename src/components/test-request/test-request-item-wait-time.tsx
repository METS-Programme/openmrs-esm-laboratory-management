import React, { useMemo } from "react";
import {
  TestRequestItem,
  TestRequestItemStatusCancelled,
} from "../../api/types/test-request-item";
import dayjs from "dayjs";
import { getWaitTime } from "./wait-time";

export interface ITestRequestItemWaitTimeProps {
  testRequestItem: TestRequestItem;
  translator: (key: string, defaultValue: string) => string;
  mode?: "Result" | "Completed";
}

const TestRequestItemWaitTime: React.FC<ITestRequestItemWaitTimeProps> = ({
  testRequestItem,
  translator,
  mode = "Result",
}) => {
  const waitTime = useMemo(() => {
    if (
      testRequestItem.referredOut ||
      !testRequestItem.samples ||
      testRequestItem.status == TestRequestItemStatusCancelled
    ) {
      return "";
    }
    let startDate: Date = null;
    return getWaitTime(
      testRequestItem.samples?.reduce((x, y) => {
        if (!x) {
          let date =
            y?.collectionDate ??
            testRequestItem?.requestApprovalDate ??
            testRequestItem?.dateCreated;
          return date ? dayjs(date).toDate() : null;
        }
        let yDate =
          y?.collectionDate ??
          testRequestItem?.requestApprovalDate ??
          testRequestItem?.dateCreated;
        if (!yDate) return x;
        let yDateValue = dayjs(yDate).toDate();

        return yDateValue.getTime() < x.getTime() ? yDateValue : x;
      }, startDate),
      testRequestItem?.resultDate ?? testRequestItem?.completedDate,
      translator
    );
  }, [
    testRequestItem?.completedDate,
    testRequestItem?.dateCreated,
    testRequestItem.referredOut,
    testRequestItem?.requestApprovalDate,
    testRequestItem?.resultDate,
    testRequestItem.samples,
    testRequestItem.status,
    translator,
  ]);
  return <>{waitTime ?? ""}</>;
};

export default TestRequestItemWaitTime;
