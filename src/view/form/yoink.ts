function ensureValidNumber(inputValue: string) {
    const cast = +inputValue;

    if (inputValue === '' || isNaN(cast)) {
        throw new Error('Invalid number');
    }

    return cast;
}

class Yoinker extends Map<string | number, string | number | Array<string | number>> {
    private static arrayMatcher = /^(\w+)\[([0-9]*)]$/;

    handleType(input: HTMLInputElement): string | number {
        switch (input.dataset.yType || 'string') {
            case 'int':
                return Math.floor(ensureValidNumber(input.value));
            case 'number':
                return ensureValidNumber(input.value);
            case 'string':
                return input.value;
            default:
                throw new Error('Invalid type');
        }
    }

    yoinkInput(input: HTMLInputElement) {
        if (!input.name) {
            return;
        }

        return this.set(input.name, this.handleType(input));
    }

    handleArray(inputs: NodeListOf<HTMLInputElement>): void {
        for (const input of inputs) {
            const name = Yoinker.arrayMatcher.exec(input.name);
            if (!name || name.length !== 3) {
                continue;
            }

            const [_, arrayName, index] = name;
            if (!this.has(arrayName)) {
                this.set(arrayName, []);
            }

            const array = this.get(arrayName) as (string | number)[];
            const value = this.handleType(input);

            if (index) {
                array[+index] = value;
                continue;
            }

            array.push(value);
        }
    }

    handleObject() {
        throw new Error('not implemented');
    }

    toObject() {
        return Object.fromEntries(this.entries());
    }
}

export default function yoink(
    formSelectorOrElem: string | HTMLElement | null,
): Record<string | number, string | number | Array<string | number>> {
    let form: HTMLElement | null;
    if (typeof formSelectorOrElem === 'string') {
        form = document.querySelector(formSelectorOrElem);
    } else {
        form = formSelectorOrElem;
    }

    if (form === null) {
        return {};
    }

    const yoinker = new Yoinker();

    const arrayInputs: NodeListOf<HTMLInputElement> = form.querySelectorAll('input[name*="["]');
    yoinker.handleArray(arrayInputs);

    const inputs: NodeListOf<HTMLInputElement> = form.querySelectorAll(
        'input[name]:not([name*="["])',
    );

    for (const input of inputs) {
        yoinker.yoinkInput(input);
    }

    return yoinker.toObject();
}
