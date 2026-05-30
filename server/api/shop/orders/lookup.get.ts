import { createError, getQuery } from "h3";
import { and, eq } from "drizzle-orm";
import { useDb } from "~~/server/db/client";
import { orders } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
	const rawCode = (getQuery(event).code as string | undefined) ?? "";
	const rawEmail = (getQuery(event).email as string | undefined) ?? "";
	const code = rawCode.trim().toUpperCase();
	const email = rawEmail.trim().toLowerCase();

	if (!code) {
		throw createError({
			statusCode: 400,
			statusMessage: "Missing order code",
		});
	}

	if (!email) {
		throw createError({
			statusCode: 400,
			statusMessage: "Missing customer email",
		});
	}

	const db = useDb();
	const match = await db
		.select({ id: orders.id, orderCode: orders.orderCode })
		.from(orders)
		.where(and(eq(orders.orderCode, code), eq(orders.customerEmail, email)))
		.limit(1);

	if (match.length === 0) {
		throw createError({
			statusCode: 404,
			statusMessage: "Order not found for this code and email",
		});
	}

	return match[0];
});
