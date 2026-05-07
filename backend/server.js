const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let deployments = [];

app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "CloudDeployX backend is running successfully"
  });
});

app.get("/api/deployments", (req, res) => {
  res.json(deployments);
});

app.post("/api/deployments", (req, res) => {
  const deployment = {
    id: Date.now(),
    appName: req.body.appName || "CloudDeployX",
    environment: req.body.environment || "Production",
    status: "Pending",
    createdAt: new Date().toLocaleString()
  };

  deployments.unshift(deployment);

  const stages = ["Building", "Testing", "Deploying", "Deployed"];

  stages.forEach((stage, index) => {
    setTimeout(() => {
      deployments = deployments.map((item) =>
        item.id === deployment.id ? { ...item, status: stage } : item
      );
    }, (index + 1) * 3000);
  });

  res.json(deployment);
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});