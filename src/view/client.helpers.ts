'use client';

export class MapWithDefaults<TKey, TValue> extends Map<TKey, TValue> {
    getOrDefault(key: TKey, defaultValue: TValue | null | undefined = null) {
        const value = this.get(key);

        if (typeof value === 'undefined') {
            return defaultValue;
        }

        return value;
    }
}

let allCookies: MapWithDefaults<string, string> | null = null;

export function getCookies(): MapWithDefaults<string, string> {
    if (allCookies === null) {
        const pairs = document.cookie.split(';');
        const cookies = new MapWithDefaults<string, string>();

        for (const cookie of pairs) {
            const [name, rest] = cookie.split('=');

            cookies.set(name.trim(), decodeURI(rest.trim()));
        }

        allCookies = cookies;
    }

    return allCookies;
}

export function parseRoundedClassName(className: string | undefined): null | string[] {
    if (!className) {
        return null;
    }

    const roundedClassName = /(rounded[-\w]*) /.exec(className ?? '');
    if (!roundedClassName || roundedClassName.length < 2) {
        return null;
    }

    return roundedClassName[1].split('-');
}

export function withSecondModifier(cls: string[], modifier: string, joiner: string = '-'): string {
    return [cls[0], modifier, ...cls.slice(1)].join(joiner);
}

export function isMobile(): boolean {
    return window.innerWidth <= 768;
}
