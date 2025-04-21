export type Value = void | undefined | null | boolean | number | ArrayBuffer | string |
	Value[] | { [ key: string ]: Value } | ((...args: any[])=> Value);
