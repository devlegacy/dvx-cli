export const isFunction = (value: unknown): value is () => unknown => typeof value === 'function'
