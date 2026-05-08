import React, { useState, useEffect, useRef } from "react";


const LOG_TEMPLATES = {
  backend: [
    ["INFO", "Server listening on port 5000"],
    ["INFO", "MongoDB connected at mongodb://mongodb:27017/clouddeployx"],
    ["INFO", "GET /api/health 200 4ms"],
    ["WARN", "Slow query detected: 320ms on collection 'deployments'"],
    ["INFO", "POST /api/deploy 201 12ms"],
    ["INFO", "Build #48 triggered by GitHub Actions"],
    ["INFO", "Docker image pull: node:20-alpine"],
    ["INFO", "npm install completed in 18.4s"],
    ["INFO", "RUN npm run build — success"],
    ["SUCCESS", "Container clouddeployx-backend started"],
    ["ERROR", "ECONNREFUSED connecting to mongodb — retrying in 2s"],
    ["INFO", "MongoDB reconnected"],
    ["INFO", "GET /api/deployments 200 8ms"],
    ["INFO", "Health check passed"],
  ],
  frontend: [
    ["INFO", "Nginx starting on port 80"],
    ["INFO", "Serving React build from /usr/share/nginx/html"],
    ["INFO", "GET / 200"],
    ["INFO", "GET /static/js/main.chunk.js 200"],
    ["INFO", "Proxy pass /api → backend:5000"],
    ["WARN", "Large bundle detected: main.chunk.js 2.4MB"],
    ["INFO", "GET /api/health 200 5ms — proxied"],
  ],
  mongodb: [
    ["INFO", "MongoDB 7.0 starting"],
    ["INFO", "Waiting for connections on port 27017"],
    ["INFO", "Connection accepted from 172.18.0.3:49812"],
    ["INFO", "clouddeployx.deployments index built"],
    ["WARN", "Index scan on unindexed field 'commitHash' — consider adding index"],
    ["SUCCESS", "Replica set ready"],
  ],
  nginx: [
    ["INFO", "nginx/1.25.3 starting"],
    ["INFO", "Listening on 0.0.0.0:80"],
    ["INFO", "GET / HTTP/1.1 200"],
    ["INFO", "Upstream backend:5000 healthy"],
    ["WARN", "Upstream response time 420ms — threshold 400ms"],
    ["INFO", "GET /api/health HTTP/1.1 200 — upstream: backend"],
  ],
};

const LEVEL_COLORS = { INFO: "#58a6ff", WARN: "#d29922", ERROR: "#f85149", SUCCESS: "#3fb950" };

export default function LogsPanel() {
  const [service, setService] = useState("backend");
  const [logs, setLogs] = useState([]);
  const [streaming, setStreaming] = useState(true);
  const indexRef = useRef(0);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (streaming) {
      const tick = () => {
        const lines = LOG_TEMPLATES[service] || LOG_TEMPLATES.backend;
        const [level, msg] = lines[indexRef.current % lines.length];
        indexRef.current++;
        const now = new Date();
        const ts = now.toTimeString().slice(0, 8) + "." + String(now.getMilliseconds()).padStart(3, "0");
        setLogs((prev) => [...prev, { ts, level, msg }]);
        timerRef.current = setTimeout(tick, 600 + Math.random() * 1200);
      };
      timerRef.current = setTimeout(tick, 400);
    }
    return () => clearTimeout(timerRef.current);
  }, [streaming, service]);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [logs]);

  const handleServiceChange = (svc) => {
    setService(svc);
    setLogs([]);
    indexRef.current = 0;
    clearTimeout(timerRef.current);
    setStreaming(true);
  };

  return (
    <div className="panel-body" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="log-toolbar">
        <select className="log-select" value={service} onChange={(e) => handleServiceChange(e.target.value)}>
          {["backend", "frontend", "mongodb", "nginx"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button
          className={`log-btn ${streaming ? "active" : ""}`}
          onClick={() => setStreaming((s) => !s)}
        >
          <i className={`ti ti-player-${streaming ? "pause" : "play"}`} aria-hidden="true" />
          {streaming ? "Streaming" : "Paused"}
        </button>
        <button className="log-btn" onClick={() => setLogs([])}>
          <i className="ti ti-trash" aria-hidden="true" /> Clear
        </button>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--color-text-secondary)" }}>
          {logs.length} lines
        </span>
      </div>
      <div className="log-container" ref={containerRef} role="log" aria-live="polite" aria-label="Live log output">
        {logs.map((l, i) => (
          <div key={i} className="log-line">
            <span className="log-time">{l.ts}</span>
            <span className="log-level" style={{ color: LEVEL_COLORS[l.level] || "#58a6ff" }}>{l.level}</span>
            <span className="log-msg">{l.msg}</span>
          </div>
        ))}
        {streaming && <span className="log-cursor" />}
      </div>
    </div>
  );
}