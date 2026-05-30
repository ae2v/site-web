import { useDb } from "~~/server/db/client";
import { reductions as reductionsTable } from "~~/server/db/schema";
import { members as membersTable } from "~~/server/db/schema";

import { eq } from "drizzle-orm";
import { requireAuth } from "~~/server/utils/auth";
import { Reduction } from "~~/shared/models/shop";
import { Member } from "~~/shared/models/member";

export default defineEventHandler(async (event) => {
	const db = useDb();

	let profile: Member | undefined;

	try {
		const session = requireAuth(event);

		profile = await db
			.select()
			.from(membersTable)
			.where(eq(membersTable.accountId, Number(session.sub)))
			.then((res) => res[0]);
	} catch (err) {
		profile = undefined;
	}

	const data = await db.select().from(reductionsTable);

	let offers: Reduction[] = [];

	if (!profile || profile.pole !== "DIRECTION") {
		offers = data.map((offer) => ({
			...offer,
			code: "********",
		}));
	} else {
		offers = data;
	}

	return offers;
});
