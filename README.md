# Aware

Agent discovery and registration.

## Backend

### Setup

1. Navigate to the backend directory:

   ```sh
   cd backend
   ```

1. Copy (and update) the `.env.example` file to `.env`:

   ```sh
   cp .env.example .env
   ```

1. Start the database:

   ```sh
   docker-compose up -d
   ```

1. Install dependencies:

   ```sh
   pnpm install
   ```

1. Run migrations:

   ```sh
   pnpm migrate
   ```

1. Start the server (development):

   ```sh
   pnpm dev
   ```

   The server will run on `http://localhost:3000` by default.

## MCP Server

### Setup

1. Navigate to the mcp directory:

   ```sh
   cd mcp
   ```

1. Copy (and update) the `.env.example` file to `.env`:

   ```sh
   cp .env.example .env
   ```

1. Install dependencies:

   ```sh
   pnpm install
   ```

1. Start the server (development):

   ```sh
   pnpm dev
   ```

   Alternatively, you can use the inspector:

   ```sh
   pnpm inspect
   ```
