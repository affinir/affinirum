export type Value = undefined | null | number | boolean | Date | bigint | ArrayBuffer | string |
	Value[] | { [ key: string ]: Value } | ((...args: any[])=> Value);
