import { useDb } from "~~/server/db/client";
import { shopItems as itemsTable } from "~~/server/db/schema";
import { itemVariants as variantsTable } from "~~/server/db/schema";

import { ShopItem } from "~~/shared/models/shop";

import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
	const db = useDb();
	const { id } = event.context.params as { id: string };

	const data = await db
		.select()
		.from(itemsTable)
		.where(eq(itemsTable.id, Number(id)));

	if (data.length === 0) {
		throw createError({
			statusCode: 404,
			message: "Item not found",
		});
	}

	const variants = await db
		.select()
		.from(variantsTable)
		.where(eq(variantsTable.itemId, data[0]!.id)) || [];

	const item: ShopItem = {
		...data[0]!,
		variants,
	};

	return item;
});
