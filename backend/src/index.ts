/**
 * Entry point for the Aware application.
 */

import express, { Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import dotenv from "dotenv";
import { Agent } from "./agent";
import { loadAgents, addAgent } from "./data";

dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Aware API",
      version: "1.0.0",
      description: "API for managing AI agents.",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ["./src/*.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Raw JSON.
app.get("/openapi.json", (_, res) => res.json(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Agent:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - tags
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the agent.
 *         name:
 *           type: string
 *           description: The name of the agent.
 *         description:
 *           type: string
 *           description: The description of the agent.
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: List of tags associated with the agent.
 */

/**
 * @swagger
 * /agents:
 *   get:
 *     summary: Returns a list of agents.
 *     description: Optional filter by search query and/or tags.
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query to filter agents by name or description.
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated list of tags to filter agents.
 *     responses:
 *       200:
 *         description: A list of agents.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Agent'
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
 * @swagger
 * /agents/{id}:
 *   get:
 *     summary: Get an agent by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The agent ID.
 *     responses:
 *       200:
 *         description: The agent object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agent'
 *       400:
 *         description: Invalid agent ID.
 *       404:
 *         description: Agent not found.
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
 * @swagger
 * /agents:
 *   post:
 *     summary: Create a new agent.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Agent'
 *     responses:
 *       201:
 *         description: The created agent.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agent'
 *       500:
 *         description: Server error.
 */
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
