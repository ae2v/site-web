import { useDb } from "~~/server/db/client";
import { shopItems as itemsTable } from "~~/server/db/schema";
import { itemVariants as variantsTable } from "~~/server/db/schema";
import { eq } from "drizzle-orm";
import { ShopItem } from "~~/shared/models/shop";

export default defineEventHandler(async () => {
	const db = useDb();

	const data = await db.select().from(itemsTable);

	const items: ShopItem[] = [];

	for (const item of data) {
		let variants: ShopItem["variants"] = await db
			.select()
			.from(variantsTable)
			.where(eq(variantsTable.itemId, item.id));

		variants = variants.map((variant) => ({
			...variant,
		}));

		items.push({
			...item,
			variants,
		});
	}

	return items;
});
