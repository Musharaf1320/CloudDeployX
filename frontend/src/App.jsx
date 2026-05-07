import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "/api";

function App() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDeployments = async () => {
    const res = await axios.get(`${API_URL}/deployments`);
    setDeployments(res.data);
  };

  const startDeployment = async () => {
    setLoading(true);

    await axios.post(`${API_URL}/deployments`, {
      appName: "CloudDeployX",
      environment: "Production"
    });

    setLoading(false);
    fetchDeployments();
  };

  useEffect(() => {
    fetchDeployments();

    const interval = setInterval(() => {
      fetchDeployments();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1>CloudDeployX</h1>
        <p style={styles.subtitle}>
          Working DevOps Deployment Tracker using React, Node.js, Docker,
          Nginx, and CI/CD concepts.
        </p>

        <button style={styles.button} onClick={startDeployment}>
          {loading ? "Starting..." : "Start Deployment"}
        </button>

        <h2>Deployment History</h2>

        {deployments.length === 0 ? (
          <p>No deployments yet. Click Start Deployment.</p>
        ) : (
          deployments.map((deployment) => (
            <div key={deployment.id} style={styles.card}>
              <h3>{deployment.appName}</h3>
              <p><b>Environment:</b> {deployment.environment}</p>
              <p><b>Status:</b> {deployment.status}</p>
              <p><b>Started:</b> {deployment.createdAt}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f8",
    fontFamily: "Arial, sans-serif",
    padding: "40px"
  },
  container: {
    maxWidth: "800px",
    margin: "auto",
    background: "white",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
  },
  subtitle: {
    fontSize: "18px",
    color: "#555"
  },
  button: {
    marginTop: "20px",
    padding: "12px 20px",
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px"
  },
  card: {
    marginTop: "20px",
    padding: "20px",
    borderRadius: "12px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb"
  }
};

export default App;