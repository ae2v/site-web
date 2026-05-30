import { setCookie } from "h3";

export default defineEventHandler(async (event) => {
	setCookie(event, "authToken", "", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 0,
	});

	return { ok: true };
});
