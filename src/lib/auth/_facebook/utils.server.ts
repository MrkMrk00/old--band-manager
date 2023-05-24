import env from '@/env.mjs';
import fetcher from '@/lib/fetcher';

const urls = {
    getAccessToken: (clientId: string, clientSecret: string, accessCode: string, url: string) =>
        `https://graph.facebook.com/v16.0/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${accessCode}&redirect_uri=${url}`,

    getUserDetails: (accessToken: string) =>
        `https://graph.facebook.com/v16.0/me?fields=id,name&access_token=${accessToken}`,
};

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

export async function getAccessToken(
    loginCode: string,
    returnUrl: string,
): Promise<FacebookTokenResponse | FacebookErrorResponse> {
    const resp = await fetcher(
        urls.getAccessToken(env.FB_APP_ID, env.FB_APP_SECRET, loginCode, returnUrl),
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

export async function getUserInfo(
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
