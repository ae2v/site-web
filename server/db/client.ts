import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let _db: ReturnType<typeof drizzle>;

export function useDb() {
	if (!_db) {
		const pool = new Pool({
			connectionString: process.env.DATABASE_URL,
		});

		_db = drizzle(pool);
	}

	return _db;
}
