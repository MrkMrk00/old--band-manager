declare global {
    interface ProxyConstructor {
        new <TSource extends object, TTarget extends object>(
            target: TSource,
            handler: ProxyHandler<TSource>,
        ): TTarget & TSource;
    }
}

type FuncRemoveFirstArg<Func, FirstArg = any, Else = Func> = Func extends (
    a: FirstArg,
    ...args: infer RestArgs
) => infer Return
    ? (...args: RestArgs) => Return
    : Else;

type FuncWithoutFirst<Func, FirstArg = any> = Func extends () => any
    ? Func
    : FuncRemoveFirstArg<Func, FirstArg, never>;

export default function createProxyProvider<Entity extends object, UtilsObject extends object>(
    utils: UtilsObject,
) {
    return function <PartialEntity extends Partial<Entity>>(entity: PartialEntity) {
        type ValidUtils = OmitNever<{
            [key in keyof UtilsObject]: FuncWithoutFirst<UtilsObject[key], PartialEntity>;
        }>;

        return new Proxy<PartialEntity, ValidUtils>(entity, {
            get(target: PartialEntity, p: string | symbol, receiver: any): any {
                if (p in utils) {
                    (utils[p as keyof UtilsObject] as () => unknown).bind(utils, target);
                }

                return target[p as keyof PartialEntity];
            },
        }) satisfies PartialEntity & ValidUtils;
    };
}
