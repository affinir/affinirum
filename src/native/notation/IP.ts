import { Constant } from "../../Constant.js";
import { Type } from "../../Type.js";
import { EmptyBuffer, parseBoundedInteger } from "../Buffer.js";

function encodeIP(value: string): ArrayBuffer {
	const prefixLengthParts = value.split("/");
	if (prefixLengthParts.length > 2) {
		throw new Error(`Invalid IP address: ${value}`);
	}
	const zeroCompressionParts = prefixLengthParts[0].split("::");
	if (zeroCompressionParts.length > 2) {
		throw new Error(`Invalid IP address: ${value}`);
	}
	const zeroCompressionFlag = zeroCompressionParts.length === 2;
	const beginParts = zeroCompressionParts[0] ? zeroCompressionParts[0].split(":") : [];
	if (!zeroCompressionFlag && beginParts.length === 1) {
		const prefix = prefixLengthParts.length === 2 ? parseBoundedInteger(prefixLengthParts[1], 10, 0, 32) : undefined;
		const ipv4Parts = prefixLengthParts[0].split(".");
		if (ipv4Parts.length !== 4) {
			throw new Error(`Invalid IPv4 address: ${value}`);
		}
		let dv: DataView<ArrayBuffer>;
		if (prefix != null) {
			dv = new DataView(new ArrayBuffer(5));
			dv.setUint8(4, prefix);
		}
		else {
			dv = new DataView(new ArrayBuffer(4));
		}
		for (let i = 0; i < 4; ++i) {
			const octet = parseBoundedInteger(ipv4Parts[i], 10, 0, 255);
			dv.setUint8(i, octet);
		}
		return dv.buffer;
	}
	const prefix = prefixLengthParts.length === 2 ? parseBoundedInteger(prefixLengthParts[1], 10, 0, 128) : undefined;
	let dv: DataView<ArrayBuffer>;
	if (prefix != null) {
		dv = new DataView(new ArrayBuffer(17));
		dv.setUint8(16, prefix);
	}
	else {
		dv = new DataView(new ArrayBuffer(16));
	}
	const endParts = zeroCompressionFlag && zeroCompressionParts[1] ? zeroCompressionParts[1].split(":") : [];
	const lastPart = zeroCompressionFlag ? endParts[endParts.length - 1] : beginParts[beginParts.length - 1];
	const ipv4TailFlag = lastPart?.includes(".");
	if (ipv4TailFlag) {
		if (zeroCompressionFlag && beginParts.length + endParts.length > 6
			|| !zeroCompressionFlag && beginParts.length + endParts.length !== 7) {
			throw new Error(`Invalid IP address: ${value}`);
		}
		const ipv4Parts = lastPart.split(".");
		if (ipv4Parts.length !== 4) {
			throw new Error(`Invalid IP address: ${value}`);
		}
		for (let i = 0; i < 4; ++i) {
			const octet = parseBoundedInteger(ipv4Parts[i], 10, 0, 255);
			dv.setUint8(12 + i, octet);
		}
	}
	else {
		if (zeroCompressionFlag && beginParts.length + endParts.length > 7
			|| !zeroCompressionFlag && beginParts.length + endParts.length !== 8) {
			throw new Error(`Invalid IP address: ${value}`);
		}
	}
	if (beginParts.length > 0) {
		let length = beginParts.length;
		if (ipv4TailFlag && !zeroCompressionFlag) {
			--length;
		}
		for (let i = 0; i < length; ++i) {
			const hextet = parseBoundedInteger(beginParts[i], 16, 0, 0xffff);
			dv.setUint16(i << 1, hextet);
		}
	}
	if (endParts.length > 0) {
		let length = endParts.length;
		let index = 8 - endParts.length;
		if (ipv4TailFlag) {
			--length;
			--index;
		}
		for (let i = 0; i < length; ++i) {
			const hextet = parseBoundedInteger(endParts[i], 16, 0, 0xffff);
			dv.setUint16(index + i << 1, hextet);
		}
	}
	return dv.buffer;
}

function decodeIP(value: ArrayBuffer) {
	const dv = new DataView(value);
	if (dv.byteLength === 4 || dv.byteLength === 5) {
		const prefix = dv.byteLength === 5 ? dv.getUint8(4) : undefined;
		if (prefix != null && prefix > 32) {
			throw new Error(`Invalid IPv4 prefix length: ${prefix}`);
		}
		const address = Array.from({ length: 4 }, (_value, i)=> dv.getUint8(i)).join(".");
		return prefix == null ? address : `${address}/${prefix}`;
	}
	if (dv.byteLength === 16 || dv.byteLength === 17) {
		const prefix = dv.byteLength === 17 ? dv.getUint8(16) : undefined;
		if (prefix != null && prefix > 128) {
			throw new Error(`Invalid IPv6 prefix length: ${prefix}`);
		}
		const parts = Array.from({ length: 8 }, (_value, i)=> dv.getUint16(i << 1));
		let longestStart = -1;
		let longestLength = 0;
		for (let start = 0; start < parts.length;) {
			if (parts[start] !== 0) {
				++start;
				continue;
			}
			let end = start + 1;
			while (end < parts.length && parts[end] === 0) {
				++end;
			}
			if (end - start > longestLength) {
				longestStart = start;
				longestLength = end - start;
			}
			start = end;
		}
		let address: string;
		if (longestLength > 1) {
			const begin = parts.slice(0, longestStart).map((part)=> part.toString(16)).join(":");
			const end = parts.slice(longestStart + longestLength).map((part)=> part.toString(16)).join(":");
			address = `${begin}::${end}`;
		}
		else {
			address = parts.map((part)=> part.toString(16)).join(":");
		}
		return prefix == null ? address : `${address}/${prefix}`;
	}
	throw new Error(`Invalid IP buffer length: ${dv.byteLength}`);
}

class IPSet {

	private _ipv4Sets = Array<Set<bigint> | undefined>(33).fill(undefined);
	private _ipv6Sets = Array<Set<bigint> | undefined>(129).fill(undefined);

	add(...values: Array<string | string[]>) {
		for (const value of values.flat()) {
			const dv = new DataView(encodeIP(value));
			const { array, prefix, shift } = this._select(dv)
			const set = array[prefix];
			const key = shift(prefix);
			if (set) {
				set.add(key);
			}
			else {
				array[prefix] = new Set([key]);
			}
		}
		return this;
	}

	has(value: string) {
		const dv = new DataView(encodeIP(value));
		const { array, prefix, shift } = this._select(dv);
		for (let i = 0; i <= prefix; ++i) {
			const set = array[i];
			if (set) {
				const key = shift(i);
				if (set.has(key)) {
					return true;
				}
			}
		}
		return false;
	}

	clear() {
		this._ipv4Sets.fill(undefined);
		this._ipv6Sets.fill(undefined);
	}

	protected _select(dv: DataView) {
		const prefix = dv.byteLength & 1 ? dv.getUint8(dv.byteLength - 1) : dv.byteLength << 3;
		if (dv.byteLength < 16) {
			const address = BigInt(dv.getUint32(0));
			const shift = (p: number)=> address >> BigInt(32 - p);
			return {
				array: this._ipv4Sets,
				prefix,
				shift,
			};
		}
		else {
			const address = dv.getBigUint64(0) << 64n | dv.getBigUint64(8);
			const shift = (p: number)=> address >> BigInt(128 - p);
			return {
				array: this._ipv6Sets,
				prefix,
				shift,
			};
		}
	}

}

const funcMatchIP = new Constant(
	(values: string[], ...search: (string | string[])[])=> {
		try {
			const ipset = new IPSet().add(values);
			for (const ip of search.flat()) {
				try {
					if (ipset.has(ip)) {
						return true;
					}
				}
				catch {}
			}
		}
		catch {}
		return false;
	},
	Type.functionType(Type.Boolean, [Type.Array, Type.union(Type.String, Type.Array)], true),
);

const funcEncodeIP = new Constant(
	(value?: string)=> {
		if (value == null) {
			return EmptyBuffer;
		}
		try {
			return encodeIP(value);
		}
		catch {
			return EmptyBuffer;
		}
	},
	Type.functionType(Type.Buffer, [Type.OptionalString]),
);

const funcDecodeIP = new Constant(
	(value?: ArrayBuffer)=> {
		if (value == null) {
			return undefined;
		}
		try {
			return decodeIP(value);
		}
		catch {
			return undefined;
		}
	},
	Type.functionType(Type.OptionalString, [Type.OptionalBuffer]),
);

export const constIP = {
	Match: funcMatchIP,
	Encode: funcEncodeIP,
	Decode: funcDecodeIP,
};
