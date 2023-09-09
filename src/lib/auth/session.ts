import type { NextResponse } from 'next/server';
import type { JWTPayload } from 'jose';
import type { ResponseCookie, Session } from '@/lib/auth/utils';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

import env from '@/env.mjs';
import { SignJWT, jwtVerify, decodeJwt } from 'jose';
import { NextRequest } from 'next/server';
import { ResponseBuilder, default as createResponseBuilder } from '@/lib/http/response';

const alg = 'HS384';
const secret = new TextEncoder().encode(env.APP_SECRET);
const expirationHours = 72;

export function signJWT(payload: Record<string, string | number>): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setIssuer(env.DOMAIN)
        .setExpirationTime(`${expirationHours}h`)
        .sign(secret);
}

export const COOKIE_SETTINGS: Omit<ResponseCookie, 'value'> = {
    name: 'BAND_MANAGER_AUTH',
    httpOnly: false, // tRPC has to have access
    path: '/',
    secure: env.NODE_ENV === 'production',
    maxAge: expirationHours * 60 * 60,
    sameSite: 'lax',
} as const;

const UnreadableToken = null;

export class SessionReader {
    #valid: boolean = false;
    #rawToken: string;
    #payload: (JWTPayload & Session) | typeof UnreadableToken | undefined = undefined;

    private constructor(token: string, isValid: boolean) {
        this.#rawToken = token;
        this.#valid = isValid;
    }

    get isValid() {
        return this.#valid;
    }

    static async fromToken(token?: string) {
        if (!token) {
            return new SessionReader('', false);
        }

        let isValid = false;

        try {
            isValid = !!(await jwtVerify(token, secret, { issuer: env.DOMAIN }));
        } catch {}

        return new SessionReader(token, isValid);
    }

    static async fromRequest(request: Request) {
        if (!('cookies' in request)) {
            request = new NextRequest(request);
        }

        return SessionReader.fromToken(
            (request as NextRequest).cookies.get(COOKIE_SETTINGS.name)?.value,
        );
    }

    get userId(): number {
        if (!this.#getPayload()?.id) {
            throw new InvalidTokenError();
        }

        return this.#getPayload()!.id;
    }

    get displayName(): string {
        if (!this.#getPayload()?.display_name) {
            throw new InvalidTokenError();
        }

        return this.#getPayload()!.display_name;
    }

    get session() {
        if (!this.#getPayload()) {
            throw new InvalidTokenError();
        }

        return {
            id: this.#getPayload()!.id,
            display_name: this.#getPayload()!.display_name,
        };
    }

    get payload(): JWTPayload & Session {
        const payload = this.#getPayload();

        if (!payload) {
            throw new InvalidTokenError();
        }

        return payload;
    }

    #getPayload(): (JWTPayload & Session) | typeof UnreadableToken {
        if (!this.#valid) {
            return UnreadableToken;
        }

        if (this.#payload !== undefined) {
            return this.#payload;
        }

        try {
            this.#payload = decodeJwt(this.#rawToken) as JWTPayload & Session;
        } catch {
            this.#valid = false;

            return UnreadableToken;
        }

        return this.#payload;
    }
}

class InvalidTokenError extends Error {}

const DeleteSession = null;

export class SessionWriter {
    #data: Session | typeof DeleteSession | undefined = undefined;

    static async fromRequest(request: Request): Promise<SessionWriter> {
        const reader = await SessionReader.fromRequest(request);

        const writer = new SessionWriter();
        if (reader.isValid) {
            writer.setData(reader.session);
        }

        return writer;
    }

    deleteSession(): SessionWriter {
        this.#data = null;

        return this;
    }

    setData(data: Session): SessionWriter {
        this.#data = data;

        return this;
    }

    async inject(
        response: NextResponse | ((r: ResponseBuilder) => unknown),
    ): Promise<NextResponse> {
        if (typeof response === 'function') {
            const builder = createResponseBuilder();
            response(builder);
            response = builder.build();
        }

        if (this.#data === undefined) {
            return response;
        }

        if (this.#data === DeleteSession) {
            response.cookies.delete(COOKIE_SETTINGS.name);

            return response;
        }

        // @ts-ignore
        response.cookies.set({
            ...COOKIE_SETTINGS,
            value: await signJWT(this.#data),
        });

        return response;
    }
}

export async function useSession(
    request: Request | ReadonlyRequestCookies,
): Promise<Session | null> {
    let reader: SessionReader;

    if (request instanceof Request) {
        reader = await SessionReader.fromRequest(request);
    } else {
        const token = request.get(COOKIE_SETTINGS.name);
        if (!token) {
            return null;
        }

        reader = await SessionReader.fromToken(token.value);
    }

    return reader.isValid ? reader.session : null;
}
