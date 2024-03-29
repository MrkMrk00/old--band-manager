export type FetcherInit = RequestInit & {
    retries?: number;
};

declare global {
    interface Response {
        toJsonSafe: () => Promise<Error | any>;
    }
}

Response.prototype.toJsonSafe = async function (): Promise<Error | any> {
    try {
        return await this.json();
    } catch (e: any) {
        return e as Error;
    }
};

export default async function fetcher(
    input: Parameters<typeof fetch>[0],
    init?: FetcherInit,
): Promise<Error | Response> {
    if (init && init.retries && init.retries > 0) {
        for (let i = 0; i < init.retries; i++) {
            try {
                return await fetch(input, init);
            } catch (e: any) {
                if (i === init?.retries - 1) {
                    if (!(e instanceof Error)) {
                        return new Error(e);
                    }

                    return e;
                }
            }
        }
    }

    try {
        return await fetch(input, init);
    } catch (e: any) {
        if (!(e instanceof Error)) {
            return new Error(e);
        }

        return e;
    }
}
