import { useDb } from "~~/server/db/client";
import {
	itemVariants as itemVariantsTable,
	orders as ordersTable,
	shopItems as shopItemsTable,
} from "~~/server/db/schema";
import { requireAuth } from "~~/server/utils/auth";

import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
	const db = useDb();
	const { id } = event.context.params as { id: string };
	const orderId = Number(id);
	const code = (getQuery(event).code as string | undefined)
		?.trim()
		.toUpperCase();
	const email = (getQuery(event).email as string | undefined)
		?.trim()
		.toLowerCase();

	if (Number.isNaN(orderId)) {
		throw createError({
			statusCode: 400,
			message: "Invalid order id",
		});
	}

	const data = await db
		.select()
		.from(ordersTable)
		.where(eq(ordersTable.id, orderId));

	if (data.length === 0) {
		throw createError({
			statusCode: 404,
			message: "Order not found",
		});
	}

	const order = data[0]!;
	let isMember = false;

	try {
		const auth = requireAuth(event);
		isMember = auth.profile !== null;
	} catch {
		isMember = false;
	}

	const hasValidCredentials =
		typeof code === "string" &&
		typeof email === "string" &&
		code === order.orderCode &&
		email === order.customerEmail.toLowerCase();

	if (!hasValidCredentials && !isMember) {
		throw createError({
			statusCode: 403,
			message:
				"You are not allowed to view this order. Missing valid code/email.",
		});
	}

	const variant = await db
		.select()
		.from(itemVariantsTable)
		.where(eq(itemVariantsTable.id, order.itemId))
		.limit(1);

	const item =
		variant.length > 0
			? await db
					.select()
					.from(shopItemsTable)
					.where(eq(shopItemsTable.id, variant[0]!.itemId))
					.limit(1)
			: [];

	return {
		...order,
		variantName: variant[0]?.name ?? null,
		itemName: item[0]?.name ?? null,
		itemPrice: item[0]?.price ?? null,
	};
});
