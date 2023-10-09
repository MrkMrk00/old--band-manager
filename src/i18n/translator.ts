import { readFileSync } from 'node:fs';
import { TemplateString, ucfirst } from '@/lib/util';

export type Language = 'cs';
export type Section = 'entity' | 'errors' | 'songs' | 'nav';

export type TranslateOpt = string | number;

type DictionaryValue = string | { [key: string]: DictionaryValue };
export type Dictionary = Record<string, DictionaryValue>;

const dictionaryCache = new Map<`${Language}-${Section}`, Dictionary>();

export default function translate(
    lang: Language,
    section: Section,
    key: string,
    ...args: (TranslateOpt | undefined)[]
) {
    const cacheKey: `${Language}-${Section}` = `${lang}-${section}`;
    let dictionary = dictionaryCache.get(cacheKey);
    if (!dictionary) {
        dictionary = JSON.parse(
            readFileSync(`${process.cwd()}/src/i18n/${lang}/${section}.json`, {
                encoding: 'utf-8',
            }),
        );
        dictionaryCache.set(cacheKey, dictionary!);
    }

    const result = dictionary && key in dictionary ? dictionary[key] : undefined;
    let resStr: string = '';
    if (result && typeof result === 'object') {
        if (args.includes('f') && 'f' in result && typeof result.f === 'string') {
            resStr = result['f'];
            args = args.splice(args.indexOf('f'));
        } else if (args.includes('n') && 'n' in result && typeof result.n === 'string') {
            resStr = result['n'];
            args = args.splice(args.indexOf('n'));
        } else {
            const res = result['m'];
            resStr = typeof res === 'string' ? res : '';
            args = args.splice(args.indexOf('m'));
        }
    } else if (typeof result === 'string') {
        resStr = result;
    }

    const hasUcfirst = args.indexOf('ucfirst');
    if (hasUcfirst !== -1) {
        resStr = ucfirst(resStr);
        args = args.splice(args.indexOf('ucfirst'));
    }

    for (const appendable of args.filter(a => typeof a === 'string' && a.startsWith('a:'))) {
        const appendWith = (appendable as string).split(':')[1];
        resStr += appendWith;
    }

    args = args.filter(a => typeof a !== 'string' || !a.startsWith('a:'));

    if (resStr && args.length > 0) {
        return new TemplateString(resStr)
            .format(...(args.filter(Boolean) as TranslateOpt[]))
            .toString();
    }

    return resStr;
}
