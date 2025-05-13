/**
 * Entry point for the Aware application.
 */

import express, { Request, Response } from "express";

import dotenv from "dotenv";
import { Agent } from "./agent";
import { loadAgents, addAgent } from "./data";

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT;

/**
 * GET /agents
 *
 * Returns a list of all agents, optionally filtered by a search query and/or tags.
 *
 * @param req - The Express request object. Supports optional query parameters `query` and `tags`.
 * @param res - The Express response object. Returns a JSON array of agents.
 * @returns void
 */
app.get("/agents", async (req: Request, res: Response) => {
  let result = await loadAgents();
  const { query, tags } = req.query;

  // TODO: Better search.
  if (typeof query === "string" && query.trim() !== "") {
    const q = query.trim().toLowerCase();
    result = result.filter(
      (agent) =>
        agent.name.toLowerCase().includes(q) ||
        agent.description.toLowerCase().includes(q)
    );
  }

  if (typeof tags === "string" && tags.trim() !== "") {
    const tagList = tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    result = result.filter((agent) =>
      tagList.every((tag) =>
        agent.tags.map((t) => t.toLowerCase()).includes(tag)
      )
    );
  }

  res.json(result);
});

/**
 * GET /agents/:id
 *
 * Returns a specific agent by ID.
 *
 * @param req - The Express request object. Expects an `id` parameter in the URL.
 * @param res - The Express response object. Returns the Agent object or 404 if not found.
 * @returns void
 */
app.get("/agents/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid agent ID" });
  }
  const agents = await loadAgents();
  const agent = agents.find((a) => a.id === id);
  if (!agent) {
    return res.status(404).json({ error: "Agent not found" });
  }
  res.json(agent);
});

/**
 * POST /agents
 *
 * Adds a new agent to the database and persists it.
 *
 * @param req - The Express request object. Expects an Agent object in the request body.
 * @param res - The Express response object. Returns the created Agent object.
 * @returns void
 */
app.use(express.json());
app.post("/agents", async (req: Request, res: Response) => {
  try {
    const agent: Omit<Agent, "id"> = req.body;
    const created = await addAgent(agent);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Failed to create agent" });
  }
});

/**
 * Starts the Express server and listens for incoming requests.
 *
 * @returns void
 */
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
