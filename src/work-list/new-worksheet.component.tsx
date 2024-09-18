import React from "react";
import { useTranslation } from "react-i18next";
import EditWorksheet from "./edit-worksheet.component";

interface NewWorksheetProps {}

const NewWorksheet: React.FC<NewWorksheetProps> = () => {
  return <EditWorksheet />;
};

export default NewWorksheet;
