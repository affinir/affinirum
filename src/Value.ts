export type Value = void | undefined | null | number | boolean | Date | bigint | ArrayBuffer | string |
	Value[] | { [ key: string ]: Value } | ((...args: any[])=> Value);
