import { FileSpreadsheet } from "lucide-react";
import { lazy } from "react";

export default {
  id: "timesheet",
  title: "Timesheet",
  description: "Build the monthly Excel timesheet from your DSR history.",
  route: "/timesheet",
  icon: FileSpreadsheet,
  widget: null,
  component: lazy(() => import("./src/TimesheetApp"))
};
