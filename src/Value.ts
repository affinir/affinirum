export type PrimitiveValue = undefined | null | number | boolean | Date | bigint | ArrayBuffer | string;
export type DataValue = PrimitiveValue | Value[] | { [ key: string ]: Value };
export type Value = DataValue | ((...args: any[])=> Value);
