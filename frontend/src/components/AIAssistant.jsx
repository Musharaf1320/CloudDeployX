import React, { useState, useEffect, useRef } from "react";

const QUICK_CHIPS = [
  "Why did my last build fail?",
  "Add a new Docker service",
  "Optimize GitHub Actions",
  "Deploy to EC2",
  "Reduce AWS costs",
  "Set up health checks",
];

const KB = {
  fail: `Looking at build #44 (commit 7f1a002 on feature/nav), it failed because the Nginx proxy_pass pointed to http://backend:5000 but the backend container wasn't healthy yet when the frontend started.\n\nFix: Add health checks and use condition: service_healthy in docker-compose.yml (already in the YAML Editor's compose tab).`,
  service: `To add a new service, open YAML Editor → docker-compose.yml and add:\n\n  my-service:\n    image: my-image:tag\n    container_name: clouddeployx-my-service\n    ports:\n      - "3001:3001"\n    depends_on:\n      - mongodb\n\nThen run: docker-compose up -d my-service`,
  github: `Your workflow is in YAML Editor → ci-cd.yml. Key optimizations already applied:\n• npm ci caching\n• Docker layer caching (~40% faster builds)\n• Separate jobs: build-and-test → docker-build → deploy\n• Deploy only triggers on main branch`,
  ec2: `Deploy steps:\n1. Launch EC2 t3.small, Amazon Linux 2023, ports 80 & 22\n2. sudo yum install -y docker && sudo systemctl start docker\n3. Add EC2_HOST and EC2_SSH_KEY to GitHub Secrets\n4. The ci-cd.yml deploy job SSHs in and runs docker-compose up -d --build`,
  cost: `This month: $47.82. Top savings:\n• Switch EC2 to Reserved Instance → save ~38% ($10.60/mo)\n• GitHub Actions at 92% of free minutes — consider self-hosted runner\n• Set AWS Budget alert at $55\n\nSee the Cost Tracker tab for the full breakdown.`,
  health: `Health checks are in YAML Editor → docker-compose.yml:\n• mongodb: mongosh ping every 10s\n• backend: curl localhost:5000/api/health every 10s\n• frontend waits for backend: condition: service_healthy\n\nThis prevents the 502 error that caused build #44 to fail.`,
  log: `Live Logs tab streams real output from all containers. Switch service in the dropdown, pause/resume, or clear. In production, ship logs to CloudWatch by adding the awslogs driver to each service in docker-compose.yml.`,
};

function getLocalResponse(msg) {
  const m = msg.toLowerCase();
  if (m.includes("fail") || m.includes("error") || m.includes("why")) return KB.fail;
  if (m.includes("service") || m.includes("add") || m.includes("new container")) return KB.service;
  if (m.includes("github") || m.includes("action") || m.includes("workflow") || m.includes("optim")) return KB.github;
  if (m.includes("ec2") || m.includes("aws") || m.includes("deploy to")) return KB.ec2;
  if (m.includes("cost") || m.includes("bill") || m.includes("reduc") || m.includes("saving")) return KB.cost;
  if (m.includes("health")) return KB.health;
  if (m.includes("log")) return KB.log;
  return null;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm your CloudDeployX assistant. Ask me about deployments, Docker configs, GitHub Actions, EC2 setup, costs, or debugging your pipeline." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chipsVisible, setChipsVisible] = useState(true);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (text) => {
    if (!text.trim() || loading) return;
    setInput("");
    setChipsVisible(false);
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    const local = getLocalResponse(text);
    if (local) {
      await new Promise((r) => setTimeout(r, 800));
      setMessages((prev) => [...prev, { role: "ai", text: local }]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are a DevOps expert assistant for CloudDeployX — a full-stack CI/CD pipeline using React, Node.js/Express, MongoDB, Docker Compose, Nginx, GitHub Actions, and AWS EC2. Give concise, actionable answers. Use markdown code blocks for examples. Max 220 words.",
          messages: [{ role: "user", content: text }],
        }),
      });
      const data = await res.json();
      const reply = data.content?.find((b) => b.type === "text")?.text || "Could not get a response.";
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Connection issue. Try asking about: build failures, Docker services, GitHub Actions, EC2 setup, or cost reduction." }]);
    }
    setLoading(false);
  };

  return (
    <div className="panel-body ai-panel-body">
      <div className="ai-messages" ref={messagesRef}>
        {messages.map((m, i) => (
          <div key={i} className={`ai-msg ${m.role === "user" ? "user" : ""}`}>
            <div className={`ai-avatar ${m.role === "user" ? "avatar-user" : "avatar-ai"}`}>
              <i className={`ti ti-${m.role === "user" ? "user" : "robot"}`} aria-hidden="true" style={{ fontSize: 13 }} />
            </div>
            <div className={`ai-bubble ${m.role === "user" ? "bubble-user" : "bubble-ai"}`} style={{ whiteSpace: "pre-wrap" }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="ai-msg">
            <div className="ai-avatar avatar-ai"><i className="ti ti-robot" aria-hidden="true" style={{ fontSize: 13 }} /></div>
            <div className="ai-bubble bubble-ai">
              <div className="typing"><span /><span /><span /></div>
            </div>
          </div>
        )}
      </div>

      {chipsVisible && (
        <div className="ai-chips">
          {QUICK_CHIPS.map((c) => (
            <span key={c} className="chip" onClick={() => send(c)}>{c}</span>
          ))}
        </div>
      )}

      <div className="ai-input-area">
        <textarea
          id="ai-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your pipeline, Docker, GitHub Actions, EC2, costs..."
          rows={1}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
        />
        <button className="ai-send-btn" onClick={() => send(input)} aria-label="Send message" disabled={loading}>
          <i className="ti ti-send" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}