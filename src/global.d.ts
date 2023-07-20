declare global {
    type Defined<T> = T extends undefined | null ? never : T;
}

export {};
