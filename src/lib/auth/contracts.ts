import type {
    CookieListItem,
    ResponseCookie as NextResponseCookie,
} from 'next/dist/compiled/@edge-runtime/cookies';
import type { NextRequest, NextResponse } from 'next/server';
import translate, { Language } from '@/i18n/translator';
import type { PersistentUser } from '@/model/user';

export type SessionKey = string;
export type SessionValue = string | number | SessionValue[] | { [key: SessionKey]: SessionValue };
export type SessionPayload = Record<SessionKey, SessionValue>;
export type SessionIOError = AppError;

export interface Session<
    T extends SessionPayload = SessionPayload,
    E extends SessionIOError = SessionIOError,
    ID = string,
> extends Map<keyof T, T[keyof T]> {
    read(sessionId: ID): Promise<true | E>;
    write(response: NextResponse): Promise<true | E>;
    cookie(): Promise<ResponseCookie | SessionIOError>;
}

export type ResponseCookie = NextResponseCookie & Pick<CookieListItem, 'sameSite'>;
export type AppSession = PersistentUser;

export type AuthResponse<SuccessPayload, ErrorShape> = SuccessPayload | ErrorShape;

export type AsyncAuthResponse<SuccessPayload, ErrorShape> = Promise<
    AuthResponse<SuccessPayload, ErrorShape>
>;

export interface AuthHandler<UID, SuccessPayload, ErrorShape> {
    accept(request: NextRequest): AsyncAuthResponse<SuccessPayload, ErrorShape>;
    verifyUser(identifier: UID): Promise<boolean>;
    getUserInfo(identifier: UID): AsyncAuthResponse<SuccessPayload, ErrorShape>;
}

export class MethodNotImplementedError extends Error {}

export type AppError = {
    error: true;
    message: string;
};

export const AppError = {
    create(message: string): AppError {
        return {
            error: true,
            message,
        };
    },

    createTranslatable(
        errorMessage: string,
        opts?: { lang?: Language; opts?: string[] },
    ): AppError {
        return this.create(
            translate(opts?.lang ?? 'cs', 'errors', errorMessage, ...(opts?.opts ?? ['ucfirst'])),
        );
    },

    isError(value: unknown): boolean {
        return (
            typeof value === 'object' && value !== null && 'error' in value && 'message' in value
        );
    },
};
