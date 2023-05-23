import env from '@/env.mjs';

const urls = {
    getAccessToken: (clientId: string, clientSecret: string, accessCode: string, url: string) =>
        `https://graph.facebook.com/v16.0/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${accessCode}&redirect_uri=${url}`,

    getUserDetails: (accessToken: string) =>
        `https://graph.facebook.com/v16.0/me?fields=id&access_token=${accessToken}`,
};

type TFacebookErrorBody = {
    error: {
        message: string;
        type: string;
        code: number;
    };
}

type TFacebookSuccessBody = {
    access_token: string;
    token_type: string;
    expires_in: number;
}

type TUserDetail = { error: object } | { id: string };

export async function getAccessToken(loginCode: string, returnUrl: string) {
    let body: TFacebookSuccessBody | TFacebookErrorBody;

    try {
        const resp = await fetch(urls.getAccessToken(env.FB_APP_ID, env.FB_APP_SECRET, loginCode, returnUrl));
        body = await resp.json();
    } catch (e: any) {
        body = {
            error: {
                message: e.toString(),
                code: -1,
                type: 'Fetch error',
            },
        };
    }

    return body;
}

export async function getUserInfo(accessToken: string) {
    let userIdObj: TUserDetail;

    try {
        const userDetailsResponse = await fetch(urls.getUserDetails(accessToken));
        userIdObj = await userDetailsResponse.json();
    } catch (e: any) {
        userIdObj = {
            error: {
                message: e.toString(),
                code: -1,
                type: 'Fetch error',
            },
        };
    }

    if ('error' in userIdObj) {
        return null;
    }

    return userIdObj.id;
}