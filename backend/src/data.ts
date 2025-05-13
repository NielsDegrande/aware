/**
 * Provides data access.
 */

import { PrismaClient } from "@prisma/client";
import { Agent } from "./agent";

const prisma = new PrismaClient();

/**
 * Loads all agents from the database.
 *
 * @returns A promise that resolves to an array of Agent objects.
 */
export async function loadAgents(): Promise<Agent[]> {
  return prisma.agent.findMany();
}

/**
 * Adds a new agent to the database.
 *
 * @param agent - The agent data (without id) to add.
 * @returns A promise that resolves to the created Agent object.
 */
export async function addAgent(agent: Omit<Agent, "id">): Promise<Agent> {
  return prisma.agent.create({ data: agent });
}
