import { sprintf } from 'sprintf-js';

export { sprintf };

export function ucfirst(str: string) {
    if (str.length < 1) {
        return str;
    }

    return str.at(0)!.toUpperCase() + str.slice(1);
}

export function lcfirst(str: string) {
    if (str.length < 1) {
        return str;
    }

    return str.at(0)!.toLowerCase() + str.slice(1);
}

export class TemplateString extends String {
    format(...formatArgs: (string | number)[]): string {
        return sprintf(this.toString(), formatArgs);
    }
}

export function diffArrays<T>(array1: T[], array2: T[]): T[] {
    return [
        ...array1.filter(value => !array2.includes(value)),
        ...array2.filter(value => !array1.includes(value)),
    ];
}
