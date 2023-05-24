import type { ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

type _TailwindPermittedColor =
    | 'rose'
    | 'pink'
    | 'fuchsia'
    | 'purple'
    | 'blue'
    | 'sky'
    | 'cyan'
    | 'teal'
    | 'green'
    | 'lime'
    | 'yellow'
    | 'orange'
    | 'red'
    | 'gray'
    | 'slate';
type _TailwindPermittedShade = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

type ColorSchemeTuple = [_TailwindPermittedColor, _TailwindPermittedShade];

const specialColors: Record<string, ColorSchemeTuple> = {
    success: ['green', 500],
    danger: ['red', 600],
};

export const DEFAULT_STYLE: ColorSchemeTuple = ['yellow', 300];

class ColorStyle {
    static readonly colorShadeRegex = /^(\w+)-(\d{3})$/;
    readonly defaultScheme: ColorSchemeTuple;
    readonly #colorStyle: string | undefined;

    constructor(colorStyle: string | undefined, defaultScheme: ColorSchemeTuple = ['yellow', 300]) {
        this.#colorStyle = colorStyle;
        this.defaultScheme = defaultScheme;
    }

    getSchemeTuple(): ColorSchemeTuple {
        if (typeof this.#colorStyle === 'undefined') {
            return this.defaultScheme;
        }

        if (this.#colorStyle in specialColors) {
            return specialColors[this.#colorStyle] as ColorSchemeTuple;
        }

        if (ColorStyle.colorShadeRegex.test(this.#colorStyle)) {
            const regexRes = ColorStyle.colorShadeRegex.exec(this.#colorStyle);
            if (regexRes !== null && regexRes.length > 2) {
                const shade = +regexRes[2];

                return [regexRes[1], shade > 700 ? 700 : shade] as ColorSchemeTuple;
            }
        }

        return this.defaultScheme;
    }

    getBackgroundClasses(): string {
        const tup = this.getSchemeTuple();
        if (typeof tup === 'string') {
            return `bg-[${tup}]`;
        }

        return `bg-${tup[0]}-${tup[1]} hover:bg-${tup[0]}-${tup[1] + 100}`;
    }
}

type ColorStylePropType =
    | `${_TailwindPermittedColor}-${_TailwindPermittedShade}`
    | keyof typeof specialColors
    | 'none'
    | undefined;

type WithColorStyle<T> = T & {
    colorStyle?: ColorStylePropType;
};

function parseBackgroundClasses(colorStyle: ColorStylePropType) {
    if (typeof colorStyle === 'undefined') {
        return '';
    }

    return new ColorStyle(colorStyle).getBackgroundClasses();
}

type ButtonProps = WithColorStyle<ButtonHTMLAttributes<HTMLButtonElement>>;

export function Button(props: ButtonProps) {
    const { children, className, colorStyle, ...other } = props;
    const bgClasses = parseBackgroundClasses(colorStyle);

    return (
        <button className={`${bgClasses} rounded-lg p-2 transition-all ${className}${colorStyle === 'success' ? ' text-white' : ''}`} {...other}>
            {children}
        </button>
    );
}

type InputProps = WithColorStyle<InputHTMLAttributes<HTMLInputElement>>;

export function Input(props: InputProps) {
    const { children, className, colorStyle, ...other } = props;
    let classes = '';
    if (colorStyle !== 'none') {
        const colors = new ColorStyle(colorStyle).getSchemeTuple();
        classes += `focus:border-${colors[0]}-${colors[1]}`;
    }

    return (
        <input
            className={`${classes} bg-white border rounded-lg p-2 focus:outline-none transition-colors ${className}`}
            {...other}
        />
    );
}
