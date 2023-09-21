import { readFile } from 'node:fs/promises';
import { TemplateString } from '@/lib/util';

export type Language = 'cs';
export type Section = 'entity';

export type TranslateOpt = string | number;

type DictionaryValue = string | { [key: string]: DictionaryValue };
export type Dictionary = Record<string, DictionaryValue>;

const dictionaryCache = new Map<`${Language}-${Section}`, Dictionary>();

export default async function translate(
    lang: Language,
    section: Section,
    key: string,
    ...args: (TranslateOpt | undefined)[]
) {
    const cacheKey: `${Language}-${Section}` = `${lang}-${section}`;
    let dictionary = dictionaryCache.get(cacheKey);
    if (!dictionary) {
        dictionary = JSON.parse(await readFile(`${process.cwd()}/src/i18n/${lang}/${section}.json`, { encoding: 'utf-8' }));
        dictionaryCache.set(cacheKey, dictionary!);
    }

    const result =
        dictionary && key in dictionary ? new TemplateString(dictionary[key]) : undefined;

    if (result && args.length > 0) {
        return result.format(...(args.filter(Boolean) as TranslateOpt[]));
    }

    return result;
}
