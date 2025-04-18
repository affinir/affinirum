import { Value } from '../ValueType.js';
import { equalBuffers } from './Buffer.js';

export const equal = (value1: Value, value2: Value)=> {
	if (value1 == null || value2 == null) {
		return value1 == value2;
	}
	if (typeof value1 !== typeof value2) {
		return false;
	}
	if (typeof value1 === 'boolean' || typeof value1 === 'string' || typeof value1 === 'function') {
		return value1 === value2;
	}
	if (typeof value1 === 'number') {
		return isNaN(value1) && isNaN(value2 as number) ? true : value1 === value2;
	}
	if (value1 instanceof ArrayBuffer && value2 instanceof ArrayBuffer) {
		return equalBuffers(value1, value2);
	}
	if (Array.isArray(value1) && Array.isArray(value2)) {
		if (value1.length === value2.length) {
			for (let i = 0; i < value1.length; ++i) {
				if (!equal(value1[i], value2[i])) {
					return false;
				}
			}
			return true;
		}
		return false;
	}
	const props = new Set([...Object.getOwnPropertyNames(value1), ...Object.getOwnPropertyNames(value2)]);
	for (const prop of props) {
		if (!equal((value1 as any)[prop] as Value, (value2 as any)[prop] as Value)) {
			return false;
		}
	}
	return true;
};
