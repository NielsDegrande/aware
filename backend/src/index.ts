/**
 * Entry point for the Aware application.
 */

import express, { Request, Response } from "express";


import { Agent } from "./agent";
import { loadAgents, saveAgents } from "./data";

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

let agents: Agent[] = loadAgents();


/**
 * GET /agents
 *
 * Returns a list of all agents, optionally filtered by a search query and/or tags.
 *
 * @param req - The Express request object. Supports optional query parameters `query` and `tags`.
 * @param res - The Express response object. Returns a JSON array of agents.
 * @returns void
 */
app.get("/agents", (req: Request, res: Response) => {
  let result = agents;
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
app.get("/agents/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const agent = agents.find((a) => a.id === id);
  if (!agent) {
    return res.status(404).json({ error: "Agent not found" });
  }
  res.json(agent);
});

/**
 * POST /agents
 *
 * Adds a new agent to the in-memory list and persists it.
 *
 * @param req - The Express request object. Expects an Agent object in the request body.
 * @param res - The Express response object. Returns the created Agent object.
 * @returns void
 */
app.use(express.json());
app.post("/agents", (req: Request, res: Response) => {
  const agent: Omit<Agent, "id"> = req.body;
  // Auto-increment ID: find the max current ID and increment by 1.
  const maxId = agents.reduce((max, a) => Math.max(max, Number(a.id)), 0);
  const newAgent: Agent = {
    ...agent,
    id: String(maxId + 1),
  };
  agents.push(newAgent);
  saveAgents(agents);
  res.status(201).json(newAgent);
});


/**
 * Starts the Express server and listens for incoming requests.
 *
 * @returns void
 */
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
