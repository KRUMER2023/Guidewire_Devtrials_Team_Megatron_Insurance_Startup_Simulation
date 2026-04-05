# Sentinel

A cutting-edge Monorepo structure containing a full-stack insurance startup simulation platform.

## Quick Start Guide

Follow these simple steps to spin up the entire Sentinel environment for local development.

1. **Set Up Environment Variables**
   - Copy the `.env.example` file to create a new `.env` file at the root of the repository.
   ```bash
   cp .env.example .env
   ```
   - Open the `.env` file and **fill in your Gemini API keys**, Mapbox tokens, and any other secrets required for the simulation.

2. **Start Local Ollama (Optional for local LLM inference)**
   Ensure that your local instance of Ollama is running if you intend to use open-source weights.
   ```bash
   ollama serve
   ```

3. **Build and Spin Up the Docker Environment**
   Run the following command from the root of the monorepo to build images and launch the orchestrated containers:
   ```bash
   docker-compose up --build
   ```

## Accessible Local URLs

Once the environment is running, your applications and tools are accessible directly:

1. **Next.js Web Application**  
   [http://localhost:3000](http://localhost:3000)

2. **FastAPI Server**  
   [http://localhost:8000](http://localhost:8000)

3. **FastAPI Swagger Docs**  
   [http://localhost:8000/docs](http://localhost:8000/docs)

4. **n8n Workflow Automation Dashboard**  
   [http://localhost:5678](http://localhost:5678)

Happy coding!
