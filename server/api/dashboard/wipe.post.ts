import { createError } from "h3";
import { eq } from "drizzle-orm";

import { useDb } from "~~/server/db/client";
import { accounts, members, orders } from "~~/server/db/schema";
import { requireAuth } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
	const auth = requireAuth(event);
	const db = useDb();

	await db.transaction(async (tx) => {
		await tx
			.delete(orders)
			.where(eq(orders.customerAccountId, auth.account.id));

		await tx.delete(members).where(eq(members.accountId, auth.account.id));
		await tx.delete(accounts).where(eq(accounts.id, auth.account.id));
	});

	return { ok: true };
});
