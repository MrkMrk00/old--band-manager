import env from '@/env.mjs';

import {
    AppError,
    AsyncAuthResponse,
    AuthHandler,
    MethodNotImplementedError,
} from '@/lib/auth/contracts';
import fetcher from '@/lib/fetcher';
import { UsersRepository } from '@/lib/repositories';
import { sql } from 'kysely';

const urls = {
    getAccessToken: (clientId: string, clientSecret: string, accessCode: string, url: string) =>
        `https://graph.facebook.com/v${env.FB_VAPI}/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${accessCode}&redirect_uri=${url}`,

    getUserDetails: (accessToken: string) =>
        `https://graph.facebook.com/v${env.FB_VAPI}/me?fields=id,name&access_token=${accessToken}`,
} as const;

export type FacebookErrorResponse = {
    error: {
        message: string;
        type: string;
        code: number;
    };
};

export type FacebookTokenResponse = {
    access_token: string;
    token_type: string;
    expires_in: number;
};

export type FacebookUserDetailsResponse = {
    id: string;
    name: string;
};

export async function handleRegisterFacebookUser(
    facebookUser: FacebookUserDetailsResponse,
): Promise<AppError | { id: number; display_name: string }> {
    if (facebookUser.id === '') {
        return AppError.create('Wrong id format');
    }

    let existing = await UsersRepository.select()
        .select(['id', 'display_name'])
        .where('fb_id', '=', +facebookUser.id)
        .executeTakeFirst();

    if (typeof existing === 'undefined') {
        const res = await UsersRepository.insert()
            .values({
                fb_id: +facebookUser.id,
                display_name: facebookUser.name,
                roles: sql`'["ROLE_USER"]'`,
            })
            .executeTakeFirst();

        if (typeof res.insertId === 'undefined') {
            return AppError.create(
                `Failed to register user ${facebookUser.name} with id ${facebookUser.id}!`,
            );
        }

        existing = {
            id: Number(res.insertId),
            display_name: facebookUser.name,
        };
    }

    return existing;
}

type AsyncFacebookResponse = AsyncAuthResponse<FacebookUserDetailsResponse, FacebookErrorResponse>;

export class FacebookAuth
    implements AuthHandler<number, FacebookUserDetailsResponse, FacebookErrorResponse>
{
    readonly redirectURL: string;

    constructor(redirectURL: string) {
        this.redirectURL = redirectURL;
    }

    async accept(request: Request): AsyncFacebookResponse {
        const url = new URL(request.url);

        const tokenResponse = await this.getAccessToken(
            url.searchParams.get('code') ?? '',
            this.redirectURL,
        );
        if ('error' in tokenResponse) {
            return tokenResponse;
        }

        return await this.fetchUserInfo(tokenResponse.access_token);
    }

    async getUserInfo(identifier: number): AsyncFacebookResponse {
        throw new MethodNotImplementedError();
    }

    async verifyUser(identifier: number): Promise<boolean> {
        throw new MethodNotImplementedError();
    }

    async getAccessToken(
        loginCode: string,
        returnUrl: string,
    ): Promise<FacebookTokenResponse | FacebookErrorResponse> {
        const resp = await fetcher(
            urls.getAccessToken(env.FB_APP_ID ?? '', env.FB_APP_SECRET ?? '', loginCode, returnUrl),
            { retries: 2 },
        );

        if (resp instanceof Error) {
            return {
                error: {
                    message: resp.toString(),
                    code: -1,
                    type: 'Fetch error',
                },
            };
        }

        const body = await resp.toJsonSafe();

        if (body instanceof Error) {
            return {
                error: {
                    message: resp.toString(),
                    code: -1,
                    type: 'Fetch error',
                },
            };
        }

        return body;
    }

    async fetchUserInfo(
        accessToken: string,
    ): Promise<FacebookErrorResponse | FacebookUserDetailsResponse> {
        const resp = await fetcher(urls.getUserDetails(accessToken), {
            retries: 2,
        });

        if (resp instanceof Error) {
            return {
                error: {
                    message: resp.toString(),
                    code: -1,
                    type: 'Fetch error',
                },
            };
        }

        const fbUser = await resp.toJsonSafe();

        if (fbUser instanceof Error) {
            return {
                error: {
                    message: resp.toString(),
                    code: -1,
                    type: 'Fetch error',
                },
            };
        }

        return fbUser;
    }
}
