import { NextResponse } from 'next/server';
import type { JWTHeaderParameters, JWTPayload, JWTVerifyResult } from 'jose';
import type { AppSession, ResponseCookie } from '@/lib/auth/contracts';
import type { Session, SessionIOError } from '@/lib/auth/contracts';

import env from '@/env.mjs';
import { SignJWT, jwtVerify, decodeJwt } from 'jose';
import { NextRequest } from 'next/server';
import { ResponseBuilder, default as createResponseBuilder } from '@/lib/http/response';
import { PersistentUser } from '@/model/user';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export type CryptographyOptions = {
    algo: JWTHeaderParameters['alg'];
    expiration: `${number}${'d' | 'h' | 'm'}`;
    secret: Uint8Array;
    issuer: string;
};

const defaultCryptoOptions: CryptographyOptions = {
    algo: 'HS384',
    secret: new TextEncoder().encode(env.APP_SECRET),
    expiration: '72h',
    issuer: env.DOMAIN,
};

type SessionKey = keyof AppSession | keyof RemoveIndex<JWTPayload>;
type SessionValue = (AppSession & RemoveIndex<JWTPayload>)[SessionKey];

type JWTAppSession = AppSession & RemoveIndex<JWTPayload>;

export function getSessionRSC(cookies: ReadonlyRequestCookies) {
    return JWTSession.fromToken(cookies.get(COOKIE_SETTINGS.name)?.value);
}

export function getSessionApi(request: NextRequest) {
    return JWTSession.fromRequest(request);
}

export class JWTSession extends Map<SessionKey, SessionValue> implements Session<JWTAppSession> {
    readonly #crypto: CryptographyOptions;

    constructor(cryptoOptions: CryptographyOptions = defaultCryptoOptions) {
        super();
        this.#crypto = cryptoOptions;
    }

    static fromRequest(request: NextRequest, cryptoOptions: CryptographyOptions = defaultCryptoOptions): Promise<JWTSession | SessionIOError> {
        const token = request.cookies.get(COOKIE_SETTINGS.name)?.value ?? '';
        return this.fromToken(token, cryptoOptions);
    }

    static async fromToken(token: string | undefined | null, cryptoOptions: CryptographyOptions = defaultCryptoOptions) {
        const instance = new this(cryptoOptions);
        const result = await instance.read(token ?? '');
        if (typeof result === 'boolean') {
            return instance;
        }

        return result;
    }

    async read(token: string): Promise<true | SessionIOError> {
        const isValid = await this.#verifyAndLoad(token);
        if (!isValid) {
            return {
                error: {
                    message: 'Invalid token.',
                },
            };
        }

        return true;
    }

    async write(response: Response): Promise<true | SessionIOError> {
        if (!(response instanceof NextResponse)) {
            response = new NextResponse(null, response);
        }
        try {
            (response as NextResponse).cookies.set({
                ...COOKIE_SETTINGS,
                value: await this.#sign(Object.fromEntries(this.entries()) as JWTAppSession),
            });
        } catch (e: unknown) {
            return {
                error: {
                    message: String(e),
                },
            };
        }

        return true;
    }

    async #verifyAndLoad(token: string): Promise<boolean> {
        try {
            const result = await jwtVerify(token, this.#crypto.secret, { issuer: this.#crypto.issuer });
            for (const [key, value] of Object.entries(result.payload)) {
                this.set(key as SessionKey, value as SessionValue);
            }

            return true;
        } catch (ignore: unknown) {
            return false;
        }
    }

    #sign(payload: JWTAppSession): Promise<string> {
        return new SignJWT(payload)
            .setProtectedHeader({ alg: this.#crypto.algo })
            .setIssuedAt()
            .setIssuer(env.DOMAIN)
            .setExpirationTime(this.#crypto.expiration)
            .sign(this.#crypto.secret);
    }

    get userId(): number | undefined {
        return this.get('id') as number;
    }

    set userId(id: number | undefined) {
        this.set('id', id);
    }

    get displayName(): string | undefined {
        return this.get('display_name') as string;
    }

    set displayName(name: string | undefined) {
        this.set('display_name', name);
    }

    get issuedAt(): number | undefined {
        return this.get('iat') as number;
    }
}

/** @deprecated */
class _JWTSession<Payload> {
    #crypto: CryptographyOptions;

    constructor(cryptoOptions: CryptographyOptions) {
        this.#crypto = cryptoOptions;
    }

    static withDefaults<T>(): _JWTSession<T> {
        // @ts-ignore
        return new this({
            algo: 'HS384',
            secret: new TextEncoder().encode(env.APP_SECRET),
            expiration: '72h',
        });
    }

    sign(payload: Record<string, string | number>): Promise<string> {
        return new SignJWT(payload)
            .setProtectedHeader({ alg: this.#crypto.algo })
            .setIssuedAt()
            .setIssuer(env.DOMAIN)
            .setExpirationTime(this.#crypto.expiration)
            .sign(this.#crypto.secret);
    }

    verify(token: string): Promise<JWTVerifyResult> {
        return jwtVerify(
            token,
            this.#crypto.secret,
            { issuer: env.DOMAIN },
        );
    }

    decode(token: string): JWTPayload & Payload {
        return decodeJwt(token) as JWTPayload & Payload;
    }

    get expiration() {
        return this.#crypto.expiration;
    }

    get secret() {
        return this.#crypto.secret;
    }

    get algo() {
        return this.#crypto.algo;
    }
}

export const appSession = _JWTSession.withDefaults<PersistentUser>();

export const COOKIE_SETTINGS: Omit<ResponseCookie, 'value'> = {
    name: 'BMSESSID',
    httpOnly: false, // tRPC has to access
    path: '/',
    secure: env.NODE_ENV === 'production',
    maxAge: +appSession.expiration.replace(/\D/, '') * 60 * 60,
    sameSite: 'lax',
} as const;

const UnreadableToken = null;

/** @deprecated use getSession{RSC|Api} */
export class SessionReader<Payload> {
    sessionStrategy: _JWTSession<Payload>;

    #valid: boolean = false;
    #rawToken: string;
    #payload: (JWTPayload & Payload) | typeof UnreadableToken | undefined = undefined;

    private constructor(sessionStrategy: _JWTSession<Payload>, token: string, isValid: boolean) {
        this.sessionStrategy = sessionStrategy;
        this.#rawToken = token;
        this.#valid = isValid;
    }

    get isValid() {
        return this.#valid;
    }

    static async fromToken(token?: string) {
        if (!token) {
            return new SessionReader(appSession, '', false);
        }

        let isValid = false;

        try {
            isValid = !!(await appSession.verify(token))
        } catch {}

        return new SessionReader(appSession, token, isValid);
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

        return this.#getPayload()!.id as number;
    }

    get displayName(): string {
        if (!this.#getPayload()?.display_name) {
            throw new InvalidTokenError();
        }

        return this.#getPayload()!.display_name as string;
    }

    get session() {
        if (!this.#getPayload()) {
            throw new InvalidTokenError();
        }

        return {
            id: this.userId,
            display_name: this.displayName,
        };
    }

    get payload(): JWTPayload & Payload {
        const payload = this.#getPayload();

        if (!payload) {
            throw new InvalidTokenError();
        }

        return payload;
    }

    #getPayload(): (JWTPayload & Payload) | typeof UnreadableToken {
        if (!this.#valid) {
            return UnreadableToken;
        }

        if (this.#payload !== undefined) {
            return this.#payload;
        }

        try {
            this.#payload = this.sessionStrategy.decode(this.#rawToken);
        } catch {
            this.#valid = false;

            return UnreadableToken;
        }

        return this.#payload;
    }
}

class InvalidTokenError extends Error {}

const DeleteSession = null;

/** @deprecated use getSession{RSC|Api} */
export class SessionWriter {
    #data: AppSession | typeof DeleteSession | undefined = undefined;

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

    setData(data: AppSession): SessionWriter {
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
            value: await appSession.sign(this.#data),
        });

        return response;
    }
}
