export function zodNullToUndefined<T extends object>(arg: T) {
    for (const [key, val] of Object.values(arg)) {
        if (val === null) {
            (arg[key as keyof T] as unknown) = undefined;
        }
    }

    return arg as ReplaceValues<T, null, undefined>;
}

export function zodNumericString(s: string | undefined) {
    return !!s ? +s : undefined;
}

export function isServer() {
    return typeof process !== 'undefined';
}

export function isClient() {
    return typeof window !== 'undefined';
}
