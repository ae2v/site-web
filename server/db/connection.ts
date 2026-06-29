import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let db: ReturnType<typeof drizzle> | undefined;

export function getDb() {
	if (!db) {
		const connectionString = process.env.DATABASE_URL;

		if (!connectionString) {
			throw new Error("DATABASE_URL is not set");
		}

		const client = postgres(connectionString, { prepare: false });
		db = drizzle(client);
	}

	return db;
}
