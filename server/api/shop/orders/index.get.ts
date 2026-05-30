import { useDb } from "~~/server/db/client";
import { orders as ordersTable } from "~~/server/db/schema";
import { requireAuth } from "~~/server/utils/auth";

import { Order } from "~~/shared/models/shop";

export default defineEventHandler(async (event) => {
	const db = useDb();
	const auth = requireAuth(event);

	if (!auth.profile) {
		throw createError({
			statusCode: 403,
			statusMessage: "You are not allowed to list orders",
		});
	}

	const data = await db.select().from(ordersTable);

	const orders: Array<Order & { customerName: string }> = data.map(
		(order) => ({
			...order,
			status: order.status as Order["status"],
			customerName:
				`${order.customerFirstName} ${order.customerLastName}`.trim(),
		}),
	);

	return orders;
});
