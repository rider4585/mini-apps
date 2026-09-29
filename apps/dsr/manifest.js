import { Send } from "lucide-react";
import { lazy } from "react";

export default {
  id: "dsr",
  title: "Daily Status",
  description: "Generate pre-filled Gmail drafts for your status report.",
  route: "/dsr",
  icon: Send,
  widget: "/w/dsr",
  component: lazy(() => import("./src/DsrApp"))
};
