import type {
    CookieListItem,
    ResponseCookie as NextResponseCookie,
} from 'next/dist/compiled/@edge-runtime/cookies';
import type { PersistentUser } from '@/model/user';

export type ResponseCookie = NextResponseCookie & Pick<CookieListItem, 'sameSite'>;
export type Session = PersistentUser;

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
