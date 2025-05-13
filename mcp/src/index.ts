/**
 * Entry point for the Aware-MCP server.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

/**
 * Calls the backend REST API.
 *
 * @param path - The API path (e.g., "/agents").
 * @param options - Fetch options.
 * @returns The parsed JSON response.
 */
async function callBackend<T>(path: string, options?: RequestInit): Promise<T> {
  const baseUrl = process.env.BACKEND_URL;
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Backend error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

const server = new McpServer({
  name: "Aware-MCP",
  version: "1.0.0",
});

/**
 * Tool to fetch agents from the backend with optional query and tags.
 *
 * @param query - Optional search query string.
 * @param tags - Optional tags string.
 * @returns The list of agents as JSON.
 */
server.tool(
  "list-agents",
  {
    query: z.string().optional(),
    tags: z.string().optional(),
  },
  async ({ query, tags }) => {
    const search = new URLSearchParams();
    if (query) search.set("query", query);
    if (tags) search.set("tags", tags);
    const agents = await callBackend<any[]>(
      `/agents${search.toString() ? `?${search}` : ""}`
    );
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(agents, null, 2),
        },
      ],
    };
  }
);

/**
 * Tool to add a new agent to the backend.
 *
 * @param name - The name of the agent.
 * @param description - The description of the agent.
 * @param tags - The list of tags associated with the agent.
 * @returns The created agent as JSON.
 */
server.tool(
  "add-agent",
  {
    name: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
  },
  async ({ name, description, tags }) => {
    const agent = { name, description, tags };
    const created = await callBackend<any>("/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(agent),
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(created, null, 2),
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
