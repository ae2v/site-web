import { useDb } from "~~/server/db/client";
import { reductions as reductionsTable } from "~~/server/db/schema";

import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
	const db = useDb();
	const { id } = event.context.params as { id: string };

	const data = await db.select().from(reductionsTable).where(eq(reductionsTable.id, Number(id)));

	if (data.length === 0) {
		throw createError({
			statusCode: 404,
			message: "Offer not found",
		});
	}

	const offer = data[0]!;

	return offer;
});
