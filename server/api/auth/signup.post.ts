import { readBody, createError } from "h3";
import crypto from "crypto";

import { createAuthToken } from "~~/server/utils/auth";

import { useDb } from "~~/server/db/client";
import { accounts as accountsTable } from "~~/server/db/schema";

function hashPassword(password: string) {
	const salt = crypto.randomBytes(16);
	const derived = crypto.scryptSync(password, salt, 64);
	return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export default defineEventHandler(async (event) => {
	const body = await readBody(event).catch(() => ({}));

	const { firstName, lastName, email, password, pole } = body as Record<
		string,
		any
	>;

	if (!firstName || !lastName || !email) {
		throw createError({
			statusCode: 400,
			statusMessage: "Missing required fields",
		});
	}

	const db = useDb();

	const passwordHash = password ? hashPassword(String(password)) : null;

	const inserted = await db
		.insert(accountsTable)
		.values({
			firstName,
			lastName,
			email,
			passwordHash,
		})
		.returning();

	const created = Array.isArray(inserted) ? inserted[0]! : inserted;

	let token: string | undefined;
	if (pole === "DIRECTION") {
		token = createAuthToken(
			{ sub: String(created.id), account: created, profile: null },
			{ expiresIn: "8h" },
		);

		const { setCookie } = await import("h3");
		setCookie(event, "authToken", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 8,
		});
	}

	return { user: created };
});
