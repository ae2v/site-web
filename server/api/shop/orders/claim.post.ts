import { createError, getQuery, readBody } from "h3";
import { and, eq } from "drizzle-orm";

import { useDb } from "~~/server/db/client";
import { orders } from "~~/server/db/schema";
import { requireAuth } from "~~/server/utils/auth";

const normalizeValue = (value: unknown) => {
	if (Array.isArray(value)) {
		return value[0];
	}

	return value;
};

export default defineEventHandler(async (event) => {
	const auth = requireAuth(event);
	const body = await readBody(event).catch(() => ({}));
	const rawId = normalizeValue(body?.id ?? getQuery(event).id);
	const rawCode = normalizeValue(body?.code ?? getQuery(event).code);

	const orderId = Number(rawId);
	const orderCode = (
		typeof rawCode === "string" ? rawCode : String(rawCode ?? "")
	)
		.trim()
		.toUpperCase();

	if (Number.isNaN(orderId)) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid order id",
		});
	}

	if (!orderCode) {
		throw createError({
			statusCode: 400,
			statusMessage: "Missing order code",
		});
	}

	const db = useDb();
	const match = await db
		.select({
			id: orders.id,
			orderCode: orders.orderCode,
			customerAccountId: orders.customerAccountId,
		})
		.from(orders)
		.where(and(eq(orders.id, orderId), eq(orders.orderCode, orderCode)))
		.limit(1);

	if (match.length === 0) {
		throw createError({
			statusCode: 404,
			statusMessage: "Order not found",
		});
	}

	const order = match[0]!;

	if (order.customerAccountId !== null) {
		throw createError({
			statusCode: 409,
			statusMessage: "This order is already claimed.",
		});
	}

	const updated = await db
		.update(orders)
		.set({ customerAccountId: auth.account.id })
		.where(eq(orders.id, orderId))
		.returning({
			id: orders.id,
			customerAccountId: orders.customerAccountId,
		});

	if (updated.length === 0) {
		throw createError({
			statusCode: 409,
			statusMessage: "This order is already claimed.",
		});
	}

	return {
		ok: true,
		claimed: true,
		orderId: updated[0]!.id,
	};
});
