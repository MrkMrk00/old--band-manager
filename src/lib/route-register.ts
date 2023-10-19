import type { Database } from '@/database';

export type AdminRouteAction = 'add' | 'list' | 'show' | 'page';
type Entity = keyof Database;

export class AdminRouteBuilder {
    #searchParams = new URLSearchParams();

    #id: string | null = null;
    #entity: Entity | null = null;
    #action: AdminRouteAction = 'list';

    show(entity: Entity | null = null, id: string | number | null = null): this {
        if (id) {
            this.#id = id.toString();
        }

        if (entity) {
            this.#entity = entity;
        }

        this.#action = 'show';

        return this;
    }

    list(entity: Entity | null = null): this {
        if (entity) {
            this.#entity = entity;
        }

        this.#action = 'list';

        return this;
    }

    page(entity: Entity | null = null): this {
        if (entity) {
            this.#entity = entity;
        }

        this.#action = 'page';

        return this;
    }

    add(entity: Entity | null = null): this {
        if (entity) {
            this.#entity = entity;
        }
        this.#action = 'add';

        return this;
    }

    setEntity(entity: Entity): this {
        this.#entity = entity;

        return this;
    }

    setId(id: string | number): this {
        this.#id = id.toString();

        return this;
    }

    setBackRef(backRef: string | URL): this {
        const path = typeof backRef === 'string' ? backRef : backRef.pathname;
        this.#searchParams.append('back_ref', path);

        return this;
    }

    addSearchParam(key: string, value: string): this {
        this.#searchParams.append(key, value);

        return this;
    }

    build(): string {
        let url = `/admin/${this.#entity?.replace('_', '-') + '/' ?? ''}`;
        switch (this.#action) {
            case 'list':
                this.#searchParams.set('show', 'list');
                break;

            case 'page':
                break;

            case 'show':
                {
                    if (this.#id === null) {
                        throw new Error('id was not set');
                    }

                    url += this.#id;
                }
                break;

            case 'add':
                {
                    url += 'add';
                }
                break;
        }

        return `${url}?${this.#searchParams.toString()}`;
    }
}

export function admin(): AdminRouteBuilder {
    return new AdminRouteBuilder();
}
