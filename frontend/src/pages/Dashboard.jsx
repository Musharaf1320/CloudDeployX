import React, { useState, useEffect, useRef } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import OverviewPanel from "../components/OverviewPanel";
import DeploymentsPanel from "../components/DeploymentsPanel";
import ServicesPanel from "../components/ServicesPanel";
import LogsPanel from "../components/LogsPanel";
import YamlEditor from "../components/YamlEditor";
import CostTracker from "../components/CostTracker";
import AIAssistant from "../components/AIAssistant";

const PANELS = ["dashboard", "deployments", "services", "logs", "yaml", "cost", "ai"];

export default function Dashboard() {
  const [activePanel, setActivePanel] = useState("dashboard");
  const [buildStatus, setBuildStatus] = useState("running");

  useEffect(() => {
    const timer = setTimeout(() => setBuildStatus("passed"), 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="dashboard-root">
      <Sidebar activePanel={activePanel} onNavigate={setActivePanel} />
      <div className="dashboard-content">
        <Topbar panel={activePanel} buildStatus={buildStatus} />
        {activePanel === "dashboard" && <OverviewPanel onNavigate={setActivePanel} />}
        {activePanel === "deployments" && <DeploymentsPanel />}
        {activePanel === "services" && <ServicesPanel />}
        {activePanel === "logs" && <LogsPanel />}
        {activePanel === "yaml" && <YamlEditor />}
        {activePanel === "cost" && <CostTracker />}
        {activePanel === "ai" && <AIAssistant />}
      </div>
    </div>
  );
}