/**
 * Provides data access.
 *
 * Currently reads from agents.json, but will be replaced with a database in the future.
 */

import fs from "fs";
import path from "path";
import { Agent } from "./agent";

/**
 * Loads all agents from the data source.
 *
 * @returns An array of Agent objects.
 */
export function loadAgents(): Agent[] {
  const agentsFilePath = path.join(__dirname, "../agents.json");
  try {
    const data = fs.readFileSync(agentsFilePath, "utf-8");
    return JSON.parse(data) as Agent[];
  } catch (err) {
    // In production, consider throwing or handling this error more robustly.
    console.error("Failed to load agents.json:", err);
    return [];
  }
}

/**
 * Persists the given list of agents to the data source.
 *
 * @param agents - The array of Agent objects to persist.
 * @returns void
 */
export function saveAgents(agents: Agent[]): void {
  const agentsFilePath = path.join(__dirname, "../agents.json");
  try {
    fs.writeFileSync(agentsFilePath, JSON.stringify(agents, null, 2), "utf-8");
  } catch (err) {
    // TODO: Handle error appropriately in production.
    console.error("Failed to save agents.json:", err);
  }
}
