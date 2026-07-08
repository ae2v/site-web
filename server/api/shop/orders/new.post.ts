import { createError } from "h3";
import { useDb } from "~~/server/db/client";
import { itemVariants, orders } from "~~/server/db/schema";
import { eq } from "drizzle-orm";

const ORDER_CODE_LENGTH = 8;

const createRawCode = () =>
	Array.from(crypto.getRandomValues(new Uint8Array(ORDER_CODE_LENGTH)))
		.map((value) => (value % 36).toString(36).toUpperCase())
		.join("");

const createUniqueOrderCode = async (db: ReturnType<typeof useDb>) => {
	for (let attempt = 0; attempt < 10; attempt++) {
		const code = `BDE-${createRawCode()}`;
		const existing = await db
			.select({ id: orders.id })
			.from(orders)
			.where(eq(orders.orderCode, code))
			.limit(1);

		if (existing.length === 0) {
			return code;
		}
	}

	throw createError({
		statusCode: 500,
		statusMessage: "Failed to generate a unique order code",
	});
};

export default defineEventHandler(async (event) => {
	const db = useDb();

	const body = await readBody(event);
	const { items, customerFirstName, customerLastName, customerEmail } =
		body as {
			items: Array<{ variantId: number; quantity: number }>;
			customerFirstName: string;
			customerLastName: string;
			customerEmail: string;
			reductionCode: string | null;
		};

	if (!items || items.length === 0) {
		throw createError({
			statusCode: 400,
			statusMessage: "No items to order",
		});
	}

	if (!customerFirstName?.trim() || !customerLastName?.trim()) {
		throw createError({
			statusCode: 400,
			statusMessage: "Missing customer first or last name",
		});
	}

	if (!customerEmail?.trim()) {
		throw createError({
			statusCode: 400,
			statusMessage: "Missing customer email",
		});
	}

	if (!/^\S+@\S+\.\S+$/.test(customerEmail.trim())) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid customer email",
		});
	}

	const validatedItems = await Promise.all(
		items.map(async (item) => {
			if (!item.variantId || item.quantity <= 0) {
				throw createError({
					statusCode: 400,
					statusMessage: "Invalid item payload",
				});
			}

			const variant = await db
				.select({ id: itemVariants.id, stock: itemVariants.stock })
				.from(itemVariants)
				.where(eq(itemVariants.id, item.variantId))
				.limit(1);

			if (variant.length === 0) {
				throw createError({
					statusCode: 404,
					statusMessage: `Variant ${item.variantId} not found`,
				});
			}

			if (item.quantity > variant[0]!.stock) {
				throw createError({
					statusCode: 400,
					statusMessage: `Not enough stock for variant ${item.variantId}`,
				});
			}

			return item;
		}),
	);

	let customerAccountId = undefined;

	try {
		let session: AuthPayload = requireAuth(event);

		customerAccountId = session.account?.id || undefined;
	} catch (error) {
		// Si pas login on laisse la commande se faire en tant qu'invité, donc on ne fait rien ici
	}

	try {
		const createdOrders = [] as Array<{ id: number; orderCode: string }>;

		for (const item of validatedItems) {
			const orderCode = await createUniqueOrderCode(db);
			const created = await db
				.insert(orders)
				.values({
					orderCode,
					customerFirstName: customerFirstName.trim(),
					customerLastName: customerLastName.trim(),
					customerEmail: customerEmail.trim().toLowerCase(),
					customerAccountId,
					date: new Date(),
					status: "PENDING",
					itemId: item.variantId,
					quantity: item.quantity,
					reductionId: null,
				})
				.returning({ id: orders.id, orderCode: orders.orderCode });

			createdOrders.push(created[0]!);
		}

		return {
			ok: true,
			orderCount: createdOrders.length,
			orders: createdOrders,
		};
	} catch (error) {
		console.error("Failed to create orders:", error);
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to create orders",
		});
	}
});
