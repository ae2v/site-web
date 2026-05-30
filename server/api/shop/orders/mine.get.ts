import { desc, eq } from "drizzle-orm";

import { useDb } from "~~/server/db/client";
import {
	itemVariants as itemVariantsTable,
	orders as ordersTable,
	shopItems as shopItemsTable,
} from "~~/server/db/schema";
import { requireAuth } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
	const auth = requireAuth(event);
	const db = useDb();

	const orders = await db
		.select()
		.from(ordersTable)
		.where(eq(ordersTable.customerAccountId, auth.account.id))
		.orderBy(desc(ordersTable.date));

	const enriched = await Promise.all(
		orders.map(async (order) => {
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
		}),
	);

	return enriched;
});
