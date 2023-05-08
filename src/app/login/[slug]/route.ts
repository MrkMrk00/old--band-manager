import { getAccessToken } from '@/lib/facebook_auth/utils.server';

type TRest = {
    params: {
        slug: string;
    };
};

export async function GET(req: Request, { params }: TRest) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
        return new Response(`<script>history.back();</script>`, {
            headers: {
                'Content-Type': 'text/html',
            },
        });
    }

    const result = await getAccessToken(`${url.protocol}//${url.host}${url.pathname}`, code);

    if ('error' in result) {
        return new Response('Failed to get user info from Facebook.');
    }

    return new Response('<script>window.close();</script>', {
        headers: {
            'Content-Type': 'text/html',
        },
    });
}