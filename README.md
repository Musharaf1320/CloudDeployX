# CloudDeployX – Dockerized CI/CD Deployment Pipeline

CloudDeployX is a full-stack deployment project that demonstrates how to containerize a React and Node.js application using Docker, automate builds with GitHub Actions, and prepare the application for cloud deployment on AWS EC2.

## Tech Stack

- React
- Node.js
- Express.js
- Docker
- Docker Compose
- Nginx
- GitHub Actions
- AWS EC2

## Features

- Full-stack frontend and backend architecture
- REST API health check endpoint
- Dockerized frontend and backend services
- Nginx reverse proxy for API routing
- GitHub Actions workflow for CI/CD
- Cloud deployment-ready structure

## Project Architecture

Frontend React app runs through Nginx and communicates with the backend Express API using `/api` routes.

```txt
User
 |
Frontend React App
 |
Nginx Reverse Proxy
 |
Node.js Express Backend
 |
API Response