import { createError, readBody } from "h3";
import { eq } from "drizzle-orm";

import { useDb } from "~~/server/db/client";
import { departmentEnum, members } from "~~/server/db/schema";
import { requireAuth } from "~~/server/utils/auth";

const allowedDepartments = departmentEnum.enumValues;

const normalizeOptionalString = (value: unknown) => {
	if (typeof value !== "string") {
		return null;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
};

export default defineEventHandler(async (event) => {
	const auth = requireAuth(event);

	if (!auth.profile) {
		throw createError({
			statusCode: 403,
			statusMessage: "You are not allowed to edit a member profile",
		});
	}

	const body = await readBody(event).catch(() => ({}));
	const firstName = normalizeOptionalString(body?.firstName);
	const lastName = normalizeOptionalString(body?.lastName);
	const pronouns = normalizeOptionalString(body?.pronouns);
	const discord = normalizeOptionalString(body?.discord);
	const department = normalizeOptionalString(body?.department);
	const photoUrl = normalizeOptionalString(body?.photoUrl);
	const promoValue = body?.promo;
	const promo = Number(promoValue);

	if (!firstName || !lastName) {
		throw createError({
			statusCode: 400,
			statusMessage: "Missing required member fields",
		});
	}

	if (!department || !allowedDepartments.includes(department as any)) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid department",
		});
	}

	if (!Number.isInteger(promo)) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid promo",
		});
	}

	const db = useDb();
	const updated = await db
		.update(members)
		.set({
			firstName,
			lastName,
			pronouns,
			discord,
			department: department as (typeof allowedDepartments)[number],
			promo,
			photoUrl,
		})
		.where(eq(members.id, auth.profile.id))
		.returning();

	if (updated.length === 0) {
		throw createError({
			statusCode: 404,
			statusMessage: "Member not found",
		});
	}

	return { ok: true, member: updated[0]! };
});
