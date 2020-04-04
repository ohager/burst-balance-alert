export const isAsyncFn = (fn: () => any): boolean => fn.constructor.name === "AsyncFunction";
