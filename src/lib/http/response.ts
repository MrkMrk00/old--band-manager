import { NextResponse } from 'next/server';

export class ResponseBuilder {
    public _body: BodyInit | undefined = undefined;
    public _init: ResponseInit = {
        status: 200,
    };
    public _headers: Map<string, string> = new Map<string, string>();

    public _redirectUrl: string | undefined;
    public _redirectUrlParams: URLSearchParams = new URLSearchParams();

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

    build() {
        if (this._redirectUrl) {
            const params =
                this._redirectUrlParams.size > 0 ? `?${this._redirectUrlParams.toString()}` : '';

            this.header('Location', this._redirectUrl + params);
        }

        this._init.headers = Object.fromEntries(this._headers.entries());

        return new NextResponse(this._body, this._init);
    }
}

export default function response(): ResponseBuilder {
    return new ResponseBuilder();
}
