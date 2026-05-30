import { createError } from "h3";
import { eq } from "drizzle-orm";

import { useDb } from "~~/server/db/client";
import { orders } from "~~/server/db/schema";
import { requireAuth } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
	const auth = requireAuth(event);
	const db = useDb();

	const updated = await db
		.update(orders)
		.set({ status: "CANCELED" })
		.where(eq(orders.customerAccountId, auth.account.id))
		.returning({ id: orders.id });

	return {
		ok: true,
		canceledCount: updated.length,
	};
});
