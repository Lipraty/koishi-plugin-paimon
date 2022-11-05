type Methods<T> = {
    [K in keyof T]?: T[K] extends (...args: infer A) => infer R ? (this: T, ...args: A) => R : T[K]
}

export function extend<T>(prototype: T, methods: Methods<T>) {
    Object.defineProperties(prototype, Object.getOwnPropertyDescriptors(methods))
}