import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
import { parse } from "pg-connection-string";

dotenv.config({ path: ".env" });

// Parse DATABASE_URL into individual components
const dbConfig = parse(process.env.DATABASE_URL!);

export default {
  dialect: "postgresql",

  schema: "./src/lib/db/schema.ts",
  dbCredentials: {
    host: dbConfig.host!,
    port: Number(dbConfig.port!) || 5432,
    user: dbConfig.user!,
    password: dbConfig.password!,
    database: dbConfig.database!,
    ssl: dbConfig.ssl ? true : false,
  },
} satisfies Config;
