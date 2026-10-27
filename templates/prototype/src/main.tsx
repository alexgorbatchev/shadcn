import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Workbench } from "./components/Workbench";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing application root");
createRoot(root).render(
  <StrictMode>
    <Workbench />
  </StrictMode>,
);
