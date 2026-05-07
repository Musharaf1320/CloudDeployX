const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log(err));

const deploymentSchema = new mongoose.Schema({
  appName: String,
  environment: String,
  branch: String,
  commitId: String,
  version: String,
  status: String,
  logs: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Deployment = mongoose.model("Deployment", deploymentSchema);

app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "Backend working"
  });
});

app.get("/api/deployments", async (req, res) => {
  const deployments = await Deployment.find().sort({
    createdAt: -1
  });

  res.json(deployments);
});

app.post("/api/deployments", async (req, res) => {

  const deployment = await Deployment.create({
    appName: "CloudDeployX",
    environment: "Production",
    branch: "main",
    commitId: Math.random().toString(36).substring(2, 9),
    version: "v1.0.0",
    status: "Pending",
    logs: ["Deployment initialized"]
  });

  const stages = [
    {
      status: "Building",
      log: "Building Docker containers..."
    },
    {
      status: "Testing",
      log: "Running automated tests..."
    },
    {
      status: "Deploying",
      log: "Deploying application..."
    },
    {
      status: "Deployed",
      log: "Deployment successful"
    }
  ];

  stages.forEach((stage, index) => {
    setTimeout(async () => {

      const currentDeployment =
        await Deployment.findById(deployment._id);

      currentDeployment.status = stage.status;

      currentDeployment.logs.push(stage.log);

      await currentDeployment.save();

    }, (index + 1) * 3000);
  });

  res.json(deployment);
});
app.patch("/api/deployments/:id", async (req, res) => {
  const deployment = await Deployment.findById(req.params.id);

  if (!deployment) {
    return res.status(404).json({ message: "Deployment not found" });
  }

  deployment.status = req.body.status || deployment.status;

  if (req.body.log) {
    deployment.logs.push(req.body.log);
  }

  await deployment.save();

  res.json(deployment);
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});