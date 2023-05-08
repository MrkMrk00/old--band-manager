import env from '@/env.mjs';

const accessTokenUrl = (clientId: string, clientSecret: string, accessCode: string, url: string) =>
    `https://graph.facebook.com/v16.0/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${accessCode}&redirect_uri=${url}`;

const userDetailEdge = (accessToken: string) =>
    `https://graph.facebook.com/v16.0/me?access_token=${accessToken}`;


export async function getAccessToken(returnUrl: string, accessCode: string) {
    const resp = await fetch(accessTokenUrl(env.FB_APP_ID, env.FB_APP_SECRET, accessCode, returnUrl));
    const body = await resp.json();

    if ('error' in body) {
        // TODO: add toast

        return body as {
            error: {
                message: string;
                type: string;
                code: number;
            };
        };
    }

    return body as {
        access_token: string;
        token_type: string;
        expires_in: number;
    };
}