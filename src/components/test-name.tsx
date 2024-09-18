import React from "react";

export const formatTestName = (name?: string, shortName?: string) => {
  return shortName ? `${shortName}${name ? ` (${name})` : ""}` : name;
};

const TestName = ({
  name,
  shortName,
}: {
  name?: string;
  shortName?: string;
}) => {
  return <>{formatTestName(name, shortName)}</>;
};

export default TestName;
