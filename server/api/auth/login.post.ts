import crypto from "node:crypto";
import { createError, readBody, setCookie } from "h3";
import { eq } from "drizzle-orm/sql/expressions/conditions";

import { createAuthToken } from "~~/server/utils/auth";

import { db } from "~~/server/db";
import { accounts, members } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
	const body = await readBody(event).catch(() => ({}));

	const email = body?.email as string | undefined;
	const password = body?.password as string | undefined;

	if (!email || !password) {
		throw createError({
			statusCode: 400,
			statusMessage: "Missing email or password",
		});
	}

	const data = await db
		.select()
		.from(accounts)
		.where(eq(accounts.email, email));

	if (data.length === 0) {
		throw createError({
			statusCode: 401,
			statusMessage: "Invalid email or password",
		});
	}

	const account = data[0]!;

	const stored = account.passwordHash ?? null;
	let verified = false;

	if (stored) {
		if (stored.includes(":")) {
			const [saltHex, derivedHex] = stored.split(":");

			try {
				const salt = Buffer.from(saltHex!, "hex");
				const derived = Buffer.from(derivedHex!, "hex");
				const candidate = crypto.scryptSync(
					password,
					salt,
					derived.length,
				);

				verified = crypto.timingSafeEqual(candidate, derived);
			} catch (e) {
				verified = false;
			}
		} else {
			verified =
				stored ===
				crypto.createHash("sha256").update(password).digest("hex");
		}
	}

	if (!verified) {
		throw createError({
			statusCode: 401,
			statusMessage: "Invalid email or password",
		});
	}

	const profile = await db
		.select()
		.from(members)
		.where(eq(members.accountId, account.id))
		.then((res) => res[0]);

	let token: string | undefined;

	if (profile) {
		const { ...profileData } = profile;

		token = createAuthToken(
			{ sub: String(account.id), account: account, profile: profileData },
			{ expiresIn: "8h" },
		);
	} else {
		token = createAuthToken(
			{ sub: String(account.id), account: account, profile: null },
			{ expiresIn: "8h" },
		);
	}

	setCookie(event, "authToken", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 8,
	});

	return { ok: true };
});
