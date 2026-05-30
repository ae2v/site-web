import { createError, readBody } from "h3";
import { eq } from "drizzle-orm";

import { useDb } from "~~/server/db/client";
import { accounts } from "~~/server/db/schema";
import { requireAuth } from "~~/server/utils/auth";

const normalizeOptionalString = (value: unknown) => {
	if (typeof value !== "string") {
		return null;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
};

export default defineEventHandler(async (event) => {
	const auth = requireAuth(event);
	const body = await readBody(event).catch(() => ({}));

	const firstName = normalizeOptionalString(body?.firstName);
	const lastName = normalizeOptionalString(body?.lastName);
	const email = normalizeOptionalString(body?.email)?.toLowerCase() ?? null;
	const studentId = normalizeOptionalString(body?.studentId);

	if (!firstName || !lastName || !email) {
		throw createError({
			statusCode: 400,
			statusMessage: "Missing required account fields",
		});
	}

	if (!/^\S+@\S+\.\S+$/.test(email)) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid email",
		});
	}

	const db = useDb();
	const updated = await db
		.update(accounts)
		.set({
			firstName,
			lastName,
			email,
			studentId,
		})
		.where(eq(accounts.id, auth.account.id))
		.returning();

	if (updated.length === 0) {
		throw createError({
			statusCode: 404,
			statusMessage: "Account not found",
		});
	}

	return { ok: true, account: updated[0]! };
});
