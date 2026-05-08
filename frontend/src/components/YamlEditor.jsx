import React, { useState, useEffect } from "react";

const CI_YAML = `name: CloudDeployX CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install backend deps
        working-directory: ./backend
        run: npm ci

      - name: Run backend tests
        working-directory: ./backend
        run: npm test --if-present

      - name: Install frontend deps
        working-directory: ./frontend
        run: npm ci

      - name: Build frontend
        working-directory: ./frontend
        run: npm run build

  docker-build:
    needs: build-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Cache Docker layers
        uses: actions/cache@v3
        with:
          path: /tmp/.buildx-cache
          key: \${{ runner.os }}-buildx-\${{ github.sha }}
          restore-keys: |
            \${{ runner.os }}-buildx-

      - name: Build backend image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: false
          tags: clouddeployx-backend:latest
          cache-from: type=local,src=/tmp/.buildx-cache
          cache-to: type=local,dest=/tmp/.buildx-cache-new,mode=max

      - name: Build frontend image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: false
          tags: clouddeployx-frontend:latest

  deploy:
    needs: docker-build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to EC2
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: \${{ secrets.EC2_HOST }}
          username: ec2-user
          key: \${{ secrets.EC2_SSH_KEY }}
          script: |
            cd ~/clouddeployx
            git pull origin main
            docker-compose pull
            docker-compose up -d --build
            docker system prune -f`;

const COMPOSE_YAML = `version: "3.8"

services:
  mongodb:
    image: mongo:7
    container_name: clouddeployx-mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 3

  backend:
    build: ./backend
    container_name: clouddeployx-backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongodb:27017/clouddeployx
    depends_on:
      mongodb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 10s
      retries: 3

  frontend:
    build: ./frontend
    container_name: clouddeployx-frontend
    ports:
      - "80:80"
    depends_on:
      backend:
        condition: service_healthy

volumes:
  mongo-data:`;

const YAMLS = { ci: CI_YAML, compose: COMPOSE_YAML };

export default function YamlEditor() {
  const [tab, setTab] = useState("ci");
  const [content, setContent] = useState(CI_YAML);
  const [validation, setValidation] = useState(null);
  const [copied, setCopied] = useState(false);

  const steps = [...content.matchAll(/- name: (.+)/g)].map((m) => m[1].trim());

  useEffect(() => {
    setContent(YAMLS[tab]);
    setValidation(null);
  }, [tab]);

  const validate = () => {
    const hasOn = content.includes("on:");
    const hasJobs = content.includes("jobs:");
    const hasRuns = content.includes("runs-on:");
    if (tab === "compose") {
      const hasVersion = content.includes("version:");
      const hasServices = content.includes("services:");
      setValidation({ ok: hasVersion && hasServices, msg: hasVersion && hasServices ? "Valid docker-compose.yml" : "Missing required fields: " + (!hasVersion ? "version " : "") + (!hasServices ? "services" : "") });
    } else {
      setValidation({ ok: hasOn && hasJobs && hasRuns, msg: hasOn && hasJobs && hasRuns ? "Valid workflow — no issues detected" : "Missing: " + [!hasOn && "on", !hasJobs && "jobs", !hasRuns && "runs-on"].filter(Boolean).join(", ") });
    }
  };

  const copy = () => {
    navigator.clipboard?.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="panel-body yaml-panel-body">
      <div className="yaml-toolbar">
        <div className="yaml-tabs">
          {[{ key: "ci", label: "ci-cd.yml" }, { key: "compose", label: "docker-compose.yml" }].map((t) => (
            <div key={t.key} className={`yaml-tab ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>{t.label}</div>
          ))}
        </div>
        <button className="log-btn" style={{ marginLeft: "auto" }} onClick={validate}>
          <i className="ti ti-check" aria-hidden="true" /> Validate
        </button>
        <button className="log-btn" onClick={copy}>
          <i className="ti ti-copy" aria-hidden="true" /> {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="yaml-body">
        <div className="yaml-editor-wrap">
          <textarea
            className="yaml-editor"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="yaml-preview">
          <div className="yaml-preview-head">Parsed steps</div>
          {steps.length > 0 ? steps.map((s, i) => (
            <div key={i} className="yaml-step">
              <div className="yaml-step-num">{i + 1}</div>
              <div className="yaml-step-name">{s}</div>
            </div>
          )) : <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>No named steps found</div>}
          {validation && (
            <div className="yaml-validate" style={{ background: validation.ok ? "#EAF3DE" : "#FCEBEB", color: validation.ok ? "#3B6D11" : "#A32D2D" }}>
              <i className={`ti ti-${validation.ok ? "check" : "alert-triangle"}`} aria-hidden="true" /> {validation.msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}