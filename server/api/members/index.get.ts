import { useDb } from "~~/server/db/client";
import { members as membersTable } from "~~/server/db/schema";

export default defineEventHandler(async () => {
	const db = useDb();

	const members = await db.select().from(membersTable);

	return members;
});
