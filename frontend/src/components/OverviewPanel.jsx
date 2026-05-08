import React from "react";
const DEPLOYMENTS = [
  { name: "frontend", branch: "main · a3f92c1", time: "2 min ago", status: "success", color: "#639922" },
  { name: "backend", branch: "main · e9755078", time: "running", status: "running", color: "#BA7517" },
  { name: "backend", branch: "main · b2c44d9", time: "1 hr ago", status: "success", color: "#639922" },
  { name: "frontend", branch: "feature/nav · 7f1a002", time: "3 hr ago", status: "failed", color: "#A32D2D" },
  { name: "nginx", branch: "main · c019e44", time: "6 hr ago", status: "success", color: "#639922" },
];

const BADGE_CLASS = { success: "badge-green", running: "badge-amber", failed: "badge-red" };
const ENVS = [
  { env: "Production", branch: "main", status: "live", cls: "badge-green" },
  { env: "Staging", branch: "develop", status: "synced", cls: "badge-blue" },
  { env: "Preview", branch: "feature/*", status: "building", cls: "badge-amber" },
];

export default function OverviewPanel({ onNavigate }) {
  return (
    <div className="panel-body">
      <div className="metrics">
        {[
          { icon: "rocket", label: "Deployments", val: "47", sub: "↑ 12 this week", up: true },
          { icon: "check", label: "Success rate", val: "94%", sub: "↑ 2% vs last week", up: true },
          { icon: "clock", label: "Avg build time", val: "3m 12s", sub: "↑ 18s slower", up: false },
          { icon: "server", label: "Uptime", val: "99.8%", sub: "30-day average", up: true },
        ].map((m) => (
          <div key={m.label} className="metric-card">
            <div className="metric-label">
              <i className={`ti ti-${m.icon}`} aria-hidden="true" style={{ fontSize: 12 }} /> {m.label}
            </div>
            <div className="metric-val">{m.val}</div>
            <div className={`metric-sub ${m.up ? "up" : "down"}`}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-head">Recent deployments</div>
        <div className="deploy-list">
          {DEPLOYMENTS.map((d, i) => (
            <div key={i} className="deploy-row">
              <span className="deploy-dot" style={{ background: d.color }} />
              <span className="deploy-name">{d.name}</span>
              <span className="deploy-branch">{d.branch}</span>
              <span className="deploy-time">{d.time}</span>
              <span className={`badge ${BADGE_CLASS[d.status]}`}>{d.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="two-col">
        <div>
          <div className="section-head">Quick actions</div>
          <div className="action-list">
            {[
              { icon: "terminal-2", label: "View live logs", panel: "logs" },
              { icon: "code", label: "Edit workflow YAML", panel: "yaml" },
              { icon: "coin", label: "Check costs", panel: "cost" },
              { icon: "robot", label: "Ask AI assistant", panel: "ai" },
            ].map((a) => (
              <div key={a.panel} className="action-item" onClick={() => onNavigate(a.panel)}>
                <i className={`ti ti-${a.icon}`} aria-hidden="true" /> {a.label}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="section-head">Environments</div>
          <table className="env-table">
            <thead><tr><th>Env</th><th>Branch</th><th>Status</th></tr></thead>
            <tbody>
              {ENVS.map((e) => (
                <tr key={e.env}>
                  <td>{e.env}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 11 }}>{e.branch}</td>
                  <td><span className={`badge ${e.cls}`}>{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}