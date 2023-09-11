import type {
    CookieListItem,
    ResponseCookie as NextResponseCookie,
} from 'next/dist/compiled/@edge-runtime/cookies';
import type { PersistentUser } from '@/model/user';

export type SessionKey = string;
export type SessionValue = string | number | string[] | { [key: SessionKey]: SessionValue };
export type SessionPayload = Record<SessionKey, SessionValue>;
export type SessionIOError = {
    error: {
        message: string;
    };
};

export interface Session<
    T extends SessionPayload = SessionPayload,
    E extends SessionIOError = SessionIOError,
    ID = string,
> extends Map<keyof T, T[keyof T]> {
    read(sessionId: ID): Promise<true | E>;
    write(response: Response): Promise<true | E>;
}

export type ResponseCookie = NextResponseCookie & Pick<CookieListItem, 'sameSite'>;
export type AppSession = PersistentUser;

export type AuthResponse<SuccessPayload, ErrorShape> = SuccessPayload | ErrorShape;

export type AsyncAuthResponse<SuccessPayload, ErrorShape> = Promise<
    AuthResponse<SuccessPayload, ErrorShape>
>;

export interface AuthHandler<UID, SuccessPayload, ErrorShape> {
    accept(request: Request): AsyncAuthResponse<SuccessPayload, ErrorShape>;
    verifyUser(identifier: UID): Promise<boolean>;
    getUserInfo(identifier: UID): AsyncAuthResponse<SuccessPayload, ErrorShape>;
}

export class MethodNotImplementedError extends Error {}
