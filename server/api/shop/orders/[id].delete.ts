import { createError } from "h3";
import { eq } from "drizzle-orm";
import { useDb } from "~~/server/db/client";
import { orders } from "~~/server/db/schema";
import { requireAuth } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
	const auth = requireAuth(event);

	if (!auth.profile) {
		throw createError({
			statusCode: 403,
			statusMessage: "You are not allowed to delete orders",
		});
	}

	const { id } = event.context.params as { id: string };
	const orderId = Number(id);
	if (Number.isNaN(orderId)) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid order id",
		});
	}

	const db = useDb();
	const deleted = await db
		.delete(orders)
		.where(eq(orders.id, orderId))
		.returning();

	if (deleted.length === 0) {
		throw createError({
			statusCode: 404,
			statusMessage: "Order not found",
		});
	}

	return { ok: true };
});
