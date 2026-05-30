import { createHmac, timingSafeEqual } from "node:crypto";

export type JwtAudience = string | string[];

export interface JwtPayload {
	sub?: string;
	iss?: string;
	aud?: JwtAudience;
	iat?: number;
	nbf?: number;
	exp?: number;
	[key: string]: unknown;
}

export interface JwtSignOptions {
	subject?: string;
	issuer?: string;
	audience?: JwtAudience;
	issuedAt?: number;
	notBefore?: string | number;
	expiresIn?: string | number;
}

export interface JwtVerifyOptions {
	issuer?: string;
	audience?: JwtAudience;
	now?: number;
}

const JWT_HEADER = { alg: "HS256", typ: "JWT" } as const;

const base64UrlEncode = (input: string | Buffer) => {
	return Buffer.from(input)
		.toString("base64")
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
};

const base64UrlDecode = (input: string) => {
	const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
	const padding = normalized.length % 4;
	const padded = normalized + (padding ? "=".repeat(4 - padding) : "");

	return Buffer.from(padded, "base64").toString("utf8");
};

const parseDuration = (
	value: string | number | undefined,
	fallbackSeconds: number,
) => {
	if (typeof value === "number") {
		return value;
	}

	if (typeof value === "string") {
		const match = value.trim().match(/^(\d+)([smhd])$/i);

		if (!match) {
			throw new Error(`Invalid duration: ${value}`);
		}

		const amount = Number(match[1]);
		const unit = match[2]!.toLowerCase();

		switch (unit) {
			case "s":
				return amount;
			case "m":
				return amount * 60;
			case "h":
				return amount * 60 * 60;
			case "d":
				return amount * 60 * 60 * 24;
		}
	}

	return fallbackSeconds;
};

const normalizeAudience = (audience?: JwtAudience) =>
	Array.isArray(audience) ? audience : audience ? [audience] : [];

const isAudienceAllowed = (
	tokenAudience: JwtAudience | undefined,
	expected?: JwtAudience,
) => {
	if (!expected) {
		return true;
	}

	const expectedValues = normalizeAudience(expected);
	if (expectedValues.length === 0) {
		return true;
	}

	const tokenValues = normalizeAudience(tokenAudience);
	return expectedValues.some((candidate) => tokenValues.includes(candidate));
};

export const signJwt = (
	payload: JwtPayload,
	secret: string,
	options: JwtSignOptions = {},
) => {
	if (!secret) {
		throw new Error("JWT secret is required");
	}

	const now = options.issuedAt ?? Math.floor(Date.now() / 1000);
	const tokenPayload: JwtPayload = {
		...payload,
		sub: options.subject ?? payload.sub,
		iss: options.issuer ?? payload.iss,
		aud: options.audience ?? payload.aud,
		iat: now,
	};

	if (options.notBefore !== undefined) {
		tokenPayload.nbf = now + parseDuration(options.notBefore, 0);
	}

	const expiresIn = parseDuration(options.expiresIn, 60 * 60);
	tokenPayload.exp = now + expiresIn;

	const header = base64UrlEncode(JSON.stringify(JWT_HEADER));
	const body = base64UrlEncode(JSON.stringify(tokenPayload));
	const unsigned = `${header}.${body}`;
	const signature = createHmac("sha256", secret).update(unsigned).digest();

	return `${unsigned}.${base64UrlEncode(signature)}`;
};

export const verifyJwt = <T extends JwtPayload = JwtPayload>(
	token: string,
	secret: string,
	options: JwtVerifyOptions = {},
): T => {
	if (!secret) {
		throw new Error("JWT secret is required");
	}

	const parts = token.split(".");
	if (parts.length !== 3) {
		throw new Error("Invalid JWT format");
	}

	const [encodedHeader, encodedPayload, encodedSignature] = parts;
	const header = JSON.parse(base64UrlDecode(encodedHeader!)) as {
		alg?: string;
		typ?: string;
	};

	if (header.alg !== "HS256") {
		throw new Error(
			`Unsupported JWT algorithm: ${header.alg ?? "unknown"}`,
		);
	}

	const unsigned = `${encodedHeader}.${encodedPayload}`;
	const expectedSignature = createHmac("sha256", secret)
		.update(unsigned)
		.digest();
	const receivedSignature = Buffer.from(
		encodedSignature!.replace(/-/g, "+").replace(/_/g, "/"),
		"base64",
	);

	if (
		receivedSignature.length !== expectedSignature.length ||
		!timingSafeEqual(receivedSignature, expectedSignature)
	) {
		throw new Error("Invalid JWT signature");
	}

	const payload = JSON.parse(base64UrlDecode(encodedPayload!)) as T;
	const now = options.now ?? Math.floor(Date.now() / 1000);

	if (typeof payload.nbf === "number" && payload.nbf > now) {
		throw new Error("JWT is not active yet");
	}

	if (typeof payload.exp === "number" && payload.exp <= now) {
		throw new Error("JWT has expired");
	}

	if (options.issuer && payload.iss !== options.issuer) {
		throw new Error("JWT issuer mismatch");
	}

	if (!isAudienceAllowed(payload.aud, options.audience)) {
		throw new Error("JWT audience mismatch");
	}

	return payload;
};

export const getBearerToken = (authorizationHeader?: string | null) => {
	if (!authorizationHeader) {
		return null;
	}

	const [scheme, token] = authorizationHeader.split(" ");
	if (scheme?.toLowerCase() !== "bearer" || !token) {
		return null;
	}

	return token;
};
