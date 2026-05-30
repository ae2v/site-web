import { createError } from "h3";
import { eq } from "drizzle-orm";
import { useDb } from "~~/server/db/client";
import { orders } from "~~/server/db/schema";
import { requireAuth } from "~~/server/utils/auth";

const allowedStatuses = [
	"PENDING",
	"RESERVED",
	"READY",
	"CANCELED",
	"COMPLETED",
] as const;

export default defineEventHandler(async (event) => {
	const auth = requireAuth(event);

	if (!auth.profile) {
		throw createError({
			statusCode: 403,
			statusMessage: "You are not allowed to update orders",
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

	const body = await readBody(event);
	const status = (body?.status as string | undefined)?.toUpperCase();

	if (
		!status ||
		!allowedStatuses.includes(status as (typeof allowedStatuses)[number])
	) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid order status",
		});
	}

	const db = useDb();
	const updated = await db
		.update(orders)
		.set({ status })
		.where(eq(orders.id, orderId))
		.returning();

	if (updated.length === 0) {
		throw createError({
			statusCode: 404,
			statusMessage: "Order not found",
		});
	}

	return updated[0];
});
