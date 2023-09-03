import { NextResponse } from 'next/server';

export class ResponseBuilder {
    public _body: BodyInit | undefined = undefined;
    public _init: ResponseInit = {
        status: 200,
    };

    #setHeader(key: string, value: string): void {
        if (!('headers' in this._init)) {
            this._init.headers = {} as HeadersInit;
        }

        Object.assign(this._init.headers!, {
            [key]: value,
        });
    }

    body(body: BodyInit): this {
        this._body = body;

        return this;
    }

    redirect(url: string | URL, status: number = 302): this {
        this.#setHeader('Location', typeof url === 'string' ? url : url.href);
        this._init.status = status;

        return this;
    }

    redirectPost(url: string | URL): this {
        return this.redirect(url, 303);
    }

    html(body: string): this {
        this._body = body;
        this.#setHeader('Content-Type', 'text/html');

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

    get() {
        return new NextResponse(this._body, this._init);
    }
}

export default function response() {
    return new ResponseBuilder();
}
