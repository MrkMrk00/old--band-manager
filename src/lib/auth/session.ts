import type { JWTHeaderParameters, JWTPayload, JWTVerifyResult } from 'jose';
import { SignJWT, decodeJwt, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import env from '@/env.mjs';
import type { AppSession, ResponseCookie, Session, SessionIOError } from '@/lib/auth/contracts';
import { AppError } from '@/lib/auth/contracts';
import { ResponseBuilder, default as createResponseBuilder } from '@/lib/http/response';
import Logger from '@/lib/logger';
import { PersistentUser } from '@/model/user';

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

export const SessionStrategy = {
    JWT: 'jwt',
} as const;
export type SessionStrategy = (typeof SessionStrategy)[keyof typeof SessionStrategy];

type JWTSessionKey = keyof AppSession | keyof RemoveIndex<JWTPayload>;
type JWTSessionValue = (AppSession & RemoveIndex<JWTPayload>)[JWTSessionKey];

type JWTAppSession = AppSession & RemoveIndex<JWTPayload>;

export function getSession(strategy?: 'jwt'): Promise<JWTSession | SessionIOError>;
export function getSession<T extends SessionStrategy | undefined>(strategy?: T) {
    if (strategy === SessionStrategy.JWT || typeof strategy === 'undefined') {
        return JWTSession.fromToken(cookies().get(COOKIE_SETTINGS.name)?.value);
    }

    throw new Error('Unknown strategy');
}

export class JWTSession
    extends Map<JWTSessionKey, JWTSessionValue>
    implements Session<JWTAppSession>
{
    readonly #crypto: CryptographyOptions;
    readonly #logger: Logger;
    #persistentUser: { id: number, display_name: string } | null = null;

    constructor(
        cryptoOptions: CryptographyOptions = defaultCryptoOptions,
        logger: Logger = Logger.fromEnv(),
    ) {
        super();
        this.#crypto = cryptoOptions;
        this.#logger = logger;
    }

    static fromRequest(
        request: NextRequest,
        cryptoOptions: CryptographyOptions = defaultCryptoOptions,
    ): Promise<JWTSession | SessionIOError> {
        const token = request.cookies.get(COOKIE_SETTINGS.name)?.value ?? '';
        return this.fromToken(token, cryptoOptions);
    }

    static async fromToken(
        token: string | undefined | null,
        cryptoOptions: CryptographyOptions = defaultCryptoOptions,
    ) {
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
            return AppError.create('Invalid token');
        }

        return true;
    }

    async cookie(): Promise<ResponseCookie | SessionIOError> {
        try {
            return {
                ...COOKIE_SETTINGS,
                value: await this.#sign(Object.fromEntries(this.entries()) as JWTAppSession),
            };
        } catch (e: unknown) {
            const error = AppError.create('Failed to sign session cookie');
            this.#logger.error(error.message, {
                error: String(e),
                unwrittenSession: Object.fromEntries(this.entries()),
            });

            return error;
        }
    }

    async write(response: NextResponse): Promise<true | SessionIOError> {
        try {
            const cookie = await this.cookie();
            if ('error' in cookie) {
                return cookie;
            }

            response.cookies.set(cookie);
        } catch (e: unknown) {
            const error = AppError.create('Failed to write session cookie!');
            this.#logger.error(error.message, {
                error: String(e),
                unwrittenSession: Object.fromEntries(this.entries()),
            });

            return error;
        }

        return true;
    }

    async #verifyAndLoad(token: string): Promise<boolean> {
        try {
            const result = await jwtVerify(token, this.#crypto.secret, {
                issuer: this.#crypto.issuer,
            });
            for (const [key, value] of Object.entries(result.payload)) {
                this.set(key as JWTSessionKey, value as JWTSessionValue);
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

    get persistentUser() {
        return this.#persistentUser ??= {
            id: this.userId as number,
            display_name: this.displayName as string,
        };
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
        return new this(defaultCryptoOptions);
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
        return jwtVerify(token, this.#crypto.secret, { issuer: env.DOMAIN });
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

/** @deprecated use getSession */
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
            isValid = !!(await appSession.verify(token));
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

/** @deprecated use getSession */
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
