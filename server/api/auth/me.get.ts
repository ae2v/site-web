import { eq } from "drizzle-orm";

import { useDb } from "~~/server/db/client";
import { accounts, members } from "~~/server/db/schema";
import { requireAuth } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
	const payload = requireAuth(event);
	const db = useDb();
	const accountId = Number(payload.account.id);

	const accountRows = await db
		.select()
		.from(accounts)
		.where(eq(accounts.id, accountId))
		.limit(1);

	if (accountRows.length === 0) {
		throw createError({
			statusCode: 404,
			statusMessage: "Account not found",
		});
	}

	const profileRows = await db
		.select()
		.from(members)
		.where(eq(members.accountId, accountId))
		.limit(1);

	return {
		user: {
			...payload,
			account: accountRows[0]!,
			profile: profileRows[0] ?? null,
		},
	};
});
