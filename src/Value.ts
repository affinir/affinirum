export type PrimitiveValue = undefined | null | number | boolean | Date | bigint | ArrayBuffer | string;
export type Value = PrimitiveValue | Value[] | { [ key: string ]: Value } | ((...args: any[])=> Value);
