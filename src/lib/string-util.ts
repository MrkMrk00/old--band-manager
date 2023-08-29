
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
