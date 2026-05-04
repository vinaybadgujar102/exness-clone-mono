import { Pool } from "pg";

export const pool = new Pool({
  connectionString:
    "postgresql://postgres:password@localhost:5432/exness_clone",
});
