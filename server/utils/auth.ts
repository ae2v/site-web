import { createError, getHeader, getCookie, type H3Event } from "h3";
import { useRuntimeConfig } from "#imports";

import {
	getBearerToken,
	signJwt,
	verifyJwt,
	type JwtPayload,
	type JwtSignOptions,
	type JwtVerifyOptions,
} from "./jwt";

import { Account } from "~~/shared/models/auth";
import { Member } from "~~/shared/models/member";

export interface AuthPayload extends JwtPayload {
	account: Account;
	profile: (Member & { accountId: number | null }) | null;
}

const getJwtConfig = () => {
	const config = useRuntimeConfig();
	const secret = config.jwtSecret || process.env.JWT_SECRET || "";

	if (!secret) {
		throw createError({
			statusCode: 500,
			statusMessage: "JWT secret is not configured",
		});
	}

	return {
		secret,
		issuer: config.jwtIssuer || process.env.JWT_ISSUER || undefined,
		audience: config.jwtAudience || process.env.JWT_AUDIENCE || undefined,
	};
};

export const createAuthToken = (
	payload: AuthPayload,
	options: JwtSignOptions = {},
) => {
	const config = getJwtConfig();

	return signJwt(payload, config.secret, {
		issuer: options.issuer ?? config.issuer,
		audience: options.audience ?? config.audience,
		...options,
	});
};

export const verifyAuthToken = <T extends AuthPayload = AuthPayload>(
	token: string,
	options: JwtVerifyOptions = {},
): T => {
	const config = getJwtConfig();

	return verifyJwt<T>(token, config.secret, {
		issuer: options.issuer ?? config.issuer,
		audience: options.audience ?? config.audience,
		...options,
	});
};

export const getAuthTokenFromEvent = (event: H3Event) => {
	const headerToken = getBearerToken(getHeader(event, "authorization"));
	if (headerToken) return headerToken;

	const cookie = getCookie(event, "authToken");
	if (typeof cookie === "string" && cookie.length > 0) return cookie;

	return null;
};

export const requireAuth = <T extends AuthPayload = AuthPayload>(
	event: H3Event,
): T => {
	const token = getAuthTokenFromEvent(event);
	if (!token) {
		throw createError({
			statusCode: 401,
			statusMessage: "Missing bearer token",
		});
	}

	try {
		return verifyAuthToken<T>(token);
	} catch (error) {
		throw createError({
			statusCode: 401,
			statusMessage:
				error instanceof Error ? error.message : "Invalid token",
		});
	}
};
