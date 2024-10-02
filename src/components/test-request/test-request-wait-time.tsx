import React, { useMemo } from "react";
import dayjs from "dayjs";
import { TestRequest } from "../../api/types/test-request";
import { calculateWaitTime, formatWaitTime } from "./wait-time";
import { TestRequestItemStatusCancelled } from "../../api/types/test-request-item";

export interface ITestRequestWaitTimeProps {
  testRequest: TestRequest;
  translator: (key: string, defaultValue: string) => string;
}

const TestRequestWaitTime: React.FC<ITestRequestWaitTimeProps> = ({
  testRequest,
  translator,
}) => {
  const waitTime = useMemo(() => {
    let dateRange: {
      minStartDate: Date;
      maxCompletedDate: Date;
      itemHasStartButNoEnd: boolean;
    } = {
      minStartDate: null,
      maxCompletedDate: null,
      itemHasStartButNoEnd: false,
    };
    dateRange = testRequest?.tests?.reduce(
      (currentDateRange, testRequestItem) => {
        if (
          testRequestItem.referredOut ||
          !testRequestItem.samples ||
          testRequestItem.status == TestRequestItemStatusCancelled
        ) {
          return currentDateRange;
        }
        let startDate: Date = null;
        let requestDate =
          testRequestItem?.requestApprovalDate ?? testRequestItem?.dateCreated;
        startDate = testRequestItem.samples?.reduce((x, y) => {
          if (!x) {
            let xDateValue =
              y?.collectionDate && requestDate
                ? dayjs(y?.collectionDate).toDate().getTime() <
                  dayjs(requestDate).toDate().getTime()
                  ? requestDate
                  : y?.collectionDate
                : y?.collectionDate ?? requestDate;
            let dateToReturn = xDateValue ? dayjs(xDateValue).toDate() : null;
            return dateToReturn;
          }
          let yDate =
            y?.collectionDate && requestDate
              ? dayjs(y?.collectionDate).toDate().getTime() <
                dayjs(requestDate).toDate().getTime()
                ? requestDate
                : y?.collectionDate
              : y?.collectionDate ?? requestDate;
          if (!yDate) return x;
          let yDateValue = dayjs(yDate).toDate();
          return yDateValue.getTime() < x.getTime() ? yDateValue : x;
        }, startDate);

        if (startDate) {
          if (currentDateRange.minStartDate) {
            currentDateRange.minStartDate =
              currentDateRange.minStartDate.getTime() < startDate.getTime()
                ? currentDateRange.minStartDate
                : startDate;
          } else {
            currentDateRange.minStartDate = startDate;
          }
        }

        let endDate =
          testRequestItem?.resultDate ?? testRequestItem?.completedDate;
        if (endDate) {
          let completeDateValue = dayjs(endDate).toDate();
          if (currentDateRange.maxCompletedDate) {
            currentDateRange.maxCompletedDate =
              currentDateRange.maxCompletedDate.getTime() >
              completeDateValue.getTime()
                ? currentDateRange.maxCompletedDate
                : completeDateValue;
          } else {
            currentDateRange.maxCompletedDate = completeDateValue;
          }
        } else {
          currentDateRange.itemHasStartButNoEnd = true;
        }

        return currentDateRange;
      },
      dateRange
    );

    let itemTimeDifference = calculateWaitTime(
      dateRange.minStartDate,
      dateRange?.itemHasStartButNoEnd ? null : dateRange.maxCompletedDate
    );
    if (
      itemTimeDifference == null ||
      typeof itemTimeDifference == "undefined"
    ) {
      return "";
    }

    return formatWaitTime(itemTimeDifference, translator);
  }, [testRequest?.tests, translator]);

  return <>{waitTime ?? ""}</>;
};

export default TestRequestWaitTime;
