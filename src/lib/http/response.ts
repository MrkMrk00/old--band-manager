import type { ResponseCookie } from '@/lib/auth/contracts';
import { COOKIE_SETTINGS } from '@/lib/auth/session';
import { NextResponse } from 'next/server';

const DeleteCookie = Symbol('deleteCookie');

export class ResponseBuilder {
    public _body: BodyInit | undefined = undefined;
    public _init: ResponseInit = {
        status: 200,
    };
    public _headers: Map<string, string> = new Map<string, string>();

    public _redirectUrl: string | undefined;
    public _redirectUrlParams: URLSearchParams = new URLSearchParams();
    public _cookies: (ResponseCookie | { name: string; value: typeof DeleteCookie })[] = [];

    body(body: BodyInit): this {
        this._body = body;

        return this;
    }

    header(key: string, value: string): this {
        this._headers.set(key, value);

        return this;
    }

    redirect(url: string | URL, status: number = 302): this {
        this._redirectUrl = typeof url === 'string' ? url : url.href;
        this._init.status = status;

        return this;
    }

    redirectPost(url: string | URL): this {
        return this.redirect(url, 303);
    }

    html(body: string): this {
        this._body = body;
        this._headers.set('Content-Type', 'text/html');

        return this;
    }

    badRequest(): this {
        this._init.status = 400;

        return this;
    }

    notFound(): this {
        this._init.status = 404;

        return this;
    }

    serverError(): this {
        this._init.status = 500;

        return this;
    }

    errStr(error: string): this {
        this._redirectUrlParams.append('err_str', error);

        return this;
    }

    pushCookie(cookie: ResponseCookie): this {
        this._cookies.push(cookie);

        return this;
    }

    deleteCookie(name: string): this {
        this._cookies.push({ name, value: DeleteCookie });

        return this;
    }

    deleteSession(): this {
        this.deleteCookie(COOKIE_SETTINGS.name);

        return this;
    }

    status(code: number = 200, statusText?: string): this {
        this._init.status = code;

        if (statusText) {
            this._init.statusText = statusText;
        }

        return this;
    }

    json(body: object): this {
        this._headers.set('Content-Type', 'application/json');
        this.body(JSON.stringify(body));

        return this;
    }

    build() {
        if (this._redirectUrl) {
            const params =
                this._redirectUrlParams.size > 0 ? `?${this._redirectUrlParams.toString()}` : '';

            this.header('Location', this._redirectUrl + params);
        }

        this._init.headers = Object.fromEntries(this._headers.entries());

        const response = new NextResponse(this._body, this._init);
        for (const cookie of this._cookies) {
            if (cookie.value === DeleteCookie) {
                response.cookies.delete(cookie.name);
                continue;
            }

            response.cookies.set(cookie);
        }

        return response;
    }
}

export default function response(): ResponseBuilder {
    return new ResponseBuilder();
}
