import { useDb } from "~~/server/db/client";
import { events as eventsTable } from "~~/server/db/schema";

export default defineEventHandler(async () => {
	const db = useDb();

	const events = await db.select().from(eventsTable);

	return events;
});
