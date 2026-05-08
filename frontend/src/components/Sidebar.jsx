import React from "react";
const NAV = [
  { section: "Monitor" },
  { id: "dashboard", label: "Dashboard", icon: "layout-dashboard", dot: "green" },
  { id: "deployments", label: "Deployments", icon: "git-branch", dot: "amber" },
  { id: "services", label: "Services", icon: "server" },
  { section: "Tools" },
  { id: "logs", label: "Live Logs", icon: "terminal-2" },
  { id: "yaml", label: "YAML Editor", icon: "code" },
  { id: "cost", label: "Cost Tracker", icon: "coin" },
  { section: "Assistant" },
  { id: "ai", label: "AI Assistant", icon: "robot" },
];

export default function Sidebar({ activePanel, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <i className="ti ti-cloud-upload" />
        </div>
        <div>
          <div className="logo-text">CloudDeployX</div>
          <div className="logo-sub">CI/CD Pipeline</div>
        </div>
      </div>

      <nav className="nav">
        {NAV.map((item, i) =>
          item.section ? (
            <div key={i} className="nav-section">{item.section}</div>
          ) : (
            <div
              key={item.id}
              className={`nav-item ${activePanel === item.id ? "active" : ""}`}
              onClick={() => onNavigate(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onNavigate(item.id)}
            >
              <i className={`ti ti-${item.icon}`} aria-hidden="true" />
              {item.label}
              {item.dot && (
                <span className={`status-dot dot-${item.dot}`} style={{ marginLeft: "auto" }} />
              )}
            </div>
          )
        )}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span className="status-dot dot-green" />
          All systems operational
        </div>
        <div style={{ marginTop: 3 }}>EC2 us-east-1 · Docker 24.0</div>
      </div>
    </aside>
  );
}