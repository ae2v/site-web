import { useDb } from "~~/server/db/client";
import { members as membersTable } from "~~/server/db/schema";

import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
	const db = useDb();
	const { id } = event.context.params as { id: string };

	const data = await db.select().from(membersTable).where(eq(membersTable.id, Number(id)));

	if (data.length === 0) {
		throw createError({
			statusCode: 404,
			message: "Member not found",
		});
	}

	const member = data[0];

	return member;
});
