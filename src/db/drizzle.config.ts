import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables from .env file.
dotenv.config();

const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME;
const user = process.env.SQL_ADMIN_USER || process.env.SQL_USER;
const password = process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD;

if (!sqlHost) {
  throw new Error("SQL_HOST must be set in environment variables.");
}
if (!sqlDbName) {
  throw new Error("SQL_DB_NAME must be set in environment variables.");
}
if (!user) {
  throw new Error("SQL_USER or SQL_ADMIN_USER must be set in environment variables.");
}
if (!password) {
  throw new Error("SQL_PASSWORD or SQL_ADMIN_PASSWORD must be set in environment variables.");
}
console.log(`Using user: ${user} to connect to database.`);

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  // Restrict introspection/push to the tables this Drizzle schema actually
  // owns. Without this, drizzle-kit also tries to introspect
  // supabase/client_schema.sql's separate, RLS-owned objects (profiles,
  // streams, streams_public, videos, transactions) living in the same
  // `public` schema - which it doesn't manage and shouldn't alter, and
  // whose `transactions` view (security_invoker option) currently crashes
  // drizzle-kit's introspection outright (a drizzle-kit/pg version bug
  // unrelated to this schema).
  tablesFilter: [
    "users",
    "tips",
    "creator_stats",
    "pesapal_orders",
    "payout_requests",
    "scrim_lobbies",
    "live_predictions",
    "mux_live_streams",
  ],
  dbCredentials: {
    host: sqlHost,
    user: user,
    password: password,
    database: sqlDbName,
    ssl: process.env.SQL_SSL === "false"
      ? false
      : {
          rejectUnauthorized: true,
          ...(process.env.SQL_CA_CERT ? { ca: process.env.SQL_CA_CERT } : {}),
        },
  },
  verbose: true,
});
