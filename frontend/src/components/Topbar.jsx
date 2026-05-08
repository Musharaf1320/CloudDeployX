import React from "react";
const TITLES = {
  dashboard: "Overview",
  deployments: "Deployment history",
  services: "Services & containers",
  logs: "Live log stream",
  yaml: "Workflow YAML editor",
  cost: "Cost & billing tracker",
  ai: "AI assistant",
};

export default function Topbar({ panel, buildStatus }) {
  return (
    <div className="topbar">
      <div className="topbar-title">{TITLES[panel] || panel}</div>
      <div className="badges">
        <span className="badge badge-green">
          <i className="ti ti-check" style={{ fontSize: 10 }} aria-hidden="true" /> Backend healthy
        </span>
        <span className="badge badge-blue">Node 20 · React 18</span>
        {buildStatus === "running" ? (
          <span className="badge badge-amber">
            <span className="spinner" /> Building #48
          </span>
        ) : (
          <span className="badge badge-green">
            <i className="ti ti-check" style={{ fontSize: 10 }} aria-hidden="true" /> Build #48 passed
          </span>
        )}
      </div>
    </div>
  );
}