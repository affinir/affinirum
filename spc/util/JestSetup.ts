import { runInThisContext } from "node:vm";

// Match the host ArrayBuffer and Uint8Array constructors supplied by Jest.
Object.assign(globalThis, runInThisContext(`({
	DataView,
	Int8Array,
	Uint8Array,
	Uint8ClampedArray,
	Int16Array,
	Uint16Array,
	Int32Array,
	Uint32Array,
	Float32Array,
	Float64Array,
	BigInt64Array,
	BigUint64Array,
})`));
