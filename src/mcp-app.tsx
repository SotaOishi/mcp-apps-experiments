import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CompanyDashboard } from "./components/CompanyDashboard";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <CompanyDashboard />
  </StrictMode>,
);
