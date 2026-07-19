import { runAffinirumTests } from "../../helpers/AffinirumTest.js";

describe("IP parsing test", ()=> {
	runAffinirumTests([
		{
			script: "IP.Encode(ip).Format()",
			cases: [
				// Valid
				{ values: { ip: "0.0.0.0" }, result: "00000000" },
				{ values: { ip: "0.0.0.1" }, result: "00000001" },
				{ values: { ip: "1.2.3.4" }, result: "01020304" },
				{ values: { ip: "10.20.30.40" }, result: "0a141e28" },
				{ values: { ip: "127.0.0.1" }, result: "7f000001" },
				{ values: { ip: "192.168.1.1" }, result: "c0a80101" },
				{ values: { ip: "255.0.255.0" }, result: "ff00ff00" },
				{ values: { ip: "255.255.255.255" }, result: "ffffffff" },
				// IPv4 valid - subnet masks
				{ values: { ip: "0.0.0.0/0" }, result: "0000000000" },
				{ values: { ip: "192.168.1.1/1" }, result: "c0a8010101" },
				{ values: { ip: "192.168.1.1/8" }, result: "c0a8010108" },
				{ values: { ip: "192.168.1.1/24" }, result: "c0a8010118" },
				{ values: { ip: "192.168.1.1/31" }, result: "c0a801011f" },
				{ values: { ip: "255.255.255.255/32" }, result: "ffffffff20" },
				{ values: { ip: "192.168.1.1/024" }, result: "c0a8010118" },
				// Empty / malformed
				{ values: { ip: "" }, result: "" },
				{ values: { ip: "." }, result: "" },
				{ values: { ip: "..." }, result: "" },
				{ values: { ip: "...." }, result: "" },
				{ values: { ip: "1" }, result: "" },
				{ values: { ip: "1.2" }, result: "" },
				{ values: { ip: "1.2.3" }, result: "" },
				{ values: { ip: "1.2.3.4.5" }, result: "" },
				{ values: { ip: ".1.2.3.4" }, result: "" },
				{ values: { ip: "1.2.3.4." }, result: "" },
				{ values: { ip: "1..2.3" }, result: "" },
				{ values: { ip: "1.2..3" }, result: "" },
				{ values: { ip: "1.2.3." }, result: "" },
				// Out of range
				{ values: { ip: "256.0.0.1" }, result: "" },
				{ values: { ip: "0.256.0.1" }, result: "" },
				{ values: { ip: "0.0.256.1" }, result: "" },
				{ values: { ip: "0.0.0.256" }, result: "" },
				{ values: { ip: "999.999.999.999" }, result: "" },
				// Negative
				{ values: { ip: "-1.2.3.4" }, result: "" },
				{ values: { ip: "1.-2.3.4" }, result: "" },
				{ values: { ip: "1.2.-3.4" }, result: "" },
				{ values: { ip: "1.2.3.-4" }, result: "" },
				// Non-numeric
				{ values: { ip: "a.b.c.d" }, result: "" },
				{ values: { ip: "1.a.3.4" }, result: "" },
				{ values: { ip: "1.2.c.4" }, result: "" },
				{ values: { ip: "1.2.3.d" }, result: "" },
				{ values: { ip: "one.two.three.four" }, result: "" },
				// Trailing / leading garbage
				{ values: { ip: "1.2.3.4abc" }, result: "" },
				{ values: { ip: "abc1.2.3.4" }, result: "" },
				{ values: { ip: "1.2.3.4 " }, result: "" },
				{ values: { ip: " 1.2.3.4" }, result: "" },
				{ values: { ip: "1. 2.3.4" }, result: "" },
				{ values: { ip: "1.2.3. 4" }, result: "" },
				// Signs
				{ values: { ip: "+1.2.3.4" }, result: "" },
				{ values: { ip: "1.+2.3.4" }, result: "" },
				{ values: { ip: "1.2.+3.4" }, result: "" },
				{ values: { ip: "1.2.3.+4" }, result: "" },
				// Leading zeros (adjust if your parser allows them)
				{ values: { ip: "00.0.0.0" }, result: "00000000" },
				{ values: { ip: "01.2.3.4" }, result: "01020304" },
				{ values: { ip: "1.02.3.4" }, result: "01020304" },
				{ values: { ip: "1.2.003.4" }, result: "01020304" },
				{ values: { ip: "1.2.3.004" }, result: "01020304" },
				// Whitespace
				{ values: { ip: "\t1.2.3.4" }, result: "" },
				{ values: { ip: "1.2.3.4\n" }, result: "" },
				{ values: { ip: "1.\t2.3.4" }, result: "" },
				{ values: { ip: "1.2.\n3.4" }, result: "" },
				// Huge octets
				{ values: { ip: "2147483647.0.0.1" }, result: "" },
				{ values: { ip: "4294967295.0.0.1" }, result: "" },
				// IPv4 invalid - subnet masks
				{ values: { ip: "192.168.1.1/" }, result: "" },
				{ values: { ip: "192.168.1.1/33" }, result: "" },
				{ values: { ip: "192.168.1.1/128" }, result: "" },
				{ values: { ip: "192.168.1.1/-1" }, result: "" },
				{ values: { ip: "192.168.1.1/+24" }, result: "" },
				{ values: { ip: "192.168.1.1/24.0" }, result: "" },
				{ values: { ip: "192.168.1.1/abc" }, result: "" },
				{ values: { ip: "192.168.1.1/ 24" }, result: "" },
				{ values: { ip: "192.168.1.1/24 " }, result: "" },
				{ values: { ip: "192.168.1.1/24/25" }, result: "" },
				{ values: { ip: "/24" }, result: "" },
				// IPv6 valid - full form
				{ values: { ip: "0:0:0:0:0:0:0:0" }, result: "00000000000000000000000000000000" },
				{ values: { ip: "0:0:0:0:0:0:0:1" }, result: "00000000000000000000000000000001" },
				{ values: { ip: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff" }, result: "ffffffffffffffffffffffffffffffff" },
				{ values: { ip: "2001:0db8:0000:0000:0000:ff00:0042:8329" }, result: "20010db8000000000000ff0000428329" },
				// IPv6 valid - compressed
				{ values: { ip: "::" }, result: "00000000000000000000000000000000" },
				{ values: { ip: "::1" }, result: "00000000000000000000000000000001" },
				{ values: { ip: "1::" }, result: "00010000000000000000000000000000" },
				{ values: { ip: "2001:db8::" }, result: "20010db8000000000000000000000000" },
				{ values: { ip: "2001:db8::1" }, result: "20010db8000000000000000000000001" },
				{ values: { ip: "2001:db8::ff00:42:8329" }, result: "20010db8000000000000ff0000428329" },
				{ values: { ip: "fe80::2aa:ff:fe9a:4ca2" }, result: "fe8000000000000002aa00fffe9a4ca2" },
				// Compression of exactly one hextet is valid
				{ values: { ip: "::2:3:4:5:6:7:8" }, result: "00000002000300040005000600070008" },
				{ values: { ip: "1:2:3::5:6:7:8" }, result: "00010002000300000005000600070008" },
				{ values: { ip: "1:2:3:4:5:6:7::" }, result: "00010002000300040005000600070000" },
				// IPv6 valid - casing
				{ values: { ip: "ABCD:EF01:2345:6789:abcd:ef01:2345:6789" }, result: "abcdef0123456789abcdef0123456789" },
				{ values: { ip: "abcd:ef01:2345:6789:ABCD:EF01:2345:6789" }, result: "abcdef0123456789abcdef0123456789" },
				// IPv6 valid - embedded IPv4
				{ values: { ip: "::ffff:192.168.1.1" }, result: "00000000000000000000ffffc0a80101" },
				{ values: { ip: "::192.168.1.1" }, result: "000000000000000000000000c0a80101" },
				{ values: { ip: "2001:db8::192.168.1.1" }, result: "20010db80000000000000000c0a80101" },
				{ values: { ip: "2001:0db8:0000:0000:0000:ff00:201.35.65.55" }, result: "20010db8000000000000ff00c9234137" },
				{ values: { ip: "::ffff:192.168.001.001" }, result: "00000000000000000000ffffc0a80101" },
				{ values: { ip: "1:2:3:4:5::192.168.1.1" }, result: "000100020003000400050000c0a80101" },
				// IPv6 valid - subnet masks
				{ values: { ip: "::/0" }, result: "0000000000000000000000000000000000" },
				{ values: { ip: "::1/1" }, result: "0000000000000000000000000000000101" },
				{ values: { ip: "2001:db8::1/64" }, result: "20010db800000000000000000000000140" },
				{ values: { ip: "2001:db8::1/127" }, result: "20010db80000000000000000000000017f" },
				{ values: { ip: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/128" }, result: "ffffffffffffffffffffffffffffffff80" },
				{ values: { ip: "::ffff:192.168.1.1/96" }, result: "00000000000000000000ffffc0a8010160" },
				{ values: { ip: "2001:db8::1/064" }, result: "20010db800000000000000000000000140" },
				// IPv6 invalid - malformed compression
				{ values: { ip: ":::" }, result: "" },
				{ values: { ip: "::::" }, result: "" },
				{ values: { ip: "1::2::3" }, result: "" },
				{ values: { ip: "::1::" }, result: "" },
				{ values: { ip: ":1:2:3:4:5:6:7" }, result: "" },
				{ values: { ip: "1:2:3:4:5:6:7:" }, result: "" },
				// Compression must replace at least one hextet
				{ values: { ip: "::1:2:3:4:5:6:7:8" }, result: "" },
				{ values: { ip: "1:2:3:4::5:6:7:8" }, result: "" },
				{ values: { ip: "1:2:3:4:5:6:7:8::" }, result: "" },
				{ values: { ip: "::1:2:3:4:5:6:192.168.1.1" }, result: "" },
				{ values: { ip: "1:2:3::4:5:6:192.168.1.1" }, result: "" },
				{ values: { ip: "1:2:3:4:5:6::192.168.1.1" }, result: "" },
				// IPv6 invalid - wrong number of parts
				{ values: { ip: "1:2:3:4:5:6:7" }, result: "" },
				{ values: { ip: "1:2:3:4:5:6:7:8:9" }, result: "" },
				{ values: { ip: "1:2:3:4:5:6:7:8:9:10" }, result: "" },
				// IPv6 invalid - bad hex
				{ values: { ip: "g:0:0:0:0:0:0:1" }, result: "" },
				{ values: { ip: "1:2:3:4:5:6:7:zzzz" }, result: "" },
				{ values: { ip: "1:2:3:4:5:6:7:-1" }, result: "" },
				{ values: { ip: "1:2:3:4:5:6:7:+1" }, result: "" },
				// IPv6 invalid - hextet too large / too long
				{ values: { ip: "10000:0:0:0:0:0:0:1" }, result: "" },
				{ values: { ip: "12345::" }, result: "" },
				{ values: { ip: "::12345" }, result: "" },
				// IPv6 invalid - whitespace
				{ values: { ip: " ::1" }, result: "" },
				{ values: { ip: "::1 " }, result: "" },
				{ values: { ip: "1:2:3:4:5:6:7:8\n" }, result: "" },
				{ values: { ip: "1:2:3:4:5:6:7:\t8" }, result: "" },
				// IPv6 invalid - embedded IPv4 errors
				{ values: { ip: "::ffff:999.168.1.1" }, result: "" },
				{ values: { ip: "::ffff:192.168.1" }, result: "" },
				{ values: { ip: "::ffff:192.168.1.1.1" }, result: "" },
				{ values: { ip: "2001:0db8:0000:0000:0000:ff00:201.335.65.55" }, result: "" },
				// IPv6 invalid - subnet masks
				{ values: { ip: "2001:db8::1/" }, result: "" },
				{ values: { ip: "2001:db8::1/129" }, result: "" },
				{ values: { ip: "2001:db8::1/-1" }, result: "" },
				{ values: { ip: "2001:db8::1/+64" }, result: "" },
				{ values: { ip: "2001:db8::1/64.0" }, result: "" },
				{ values: { ip: "2001:db8::1/ffff" }, result: "" },
				{ values: { ip: "2001:db8::1/ 64" }, result: "" },
				{ values: { ip: "2001:db8::1/64 " }, result: "" },
				{ values: { ip: "2001:db8::1/64/128" }, result: "" },
				{ values: { ip: "2001:db8::1//64" }, result: "" },
				{ values: { ip: "/64" }, result: "" },
			],
		},
		{
			script: "IP.Encode(ip).Length",
			cases: [
				{ values: { ip: undefined }, result: 0n },
				{ values: { ip: null }, result: 0n },
			],
		},
	]);
});

describe("IP formatting test", ()=> {
	runAffinirumTests([
		{
			script: "IP.Decode(buf)",
			cases: [
				// Null
				{ values: { buf: undefined }, result: undefined },
				{ values: { buf: null }, result: undefined },
				// IPv4
				{ values: { buf: new Uint8Array([0, 0, 0, 0]).buffer }, result: "0.0.0.0" },
				{ values: { buf: new Uint8Array([10, 20, 30, 40]).buffer }, result: "10.20.30.40" },
				{ values: { buf: new Uint8Array([255, 255, 255, 255]).buffer }, result: "255.255.255.255" },
				// IPv4 with CIDR
				{ values: { buf: new Uint8Array([192, 168, 1, 1, 0]).buffer }, result: "192.168.1.1/0" },
				{ values: { buf: new Uint8Array([192, 168, 1, 1, 24]).buffer }, result: "192.168.1.1/24" },
				{ values: { buf: new Uint8Array([192, 168, 1, 1, 32]).buffer }, result: "192.168.1.1/32" },
				// IPv6 zero compression
				{ values: { buf: new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]).buffer }, result: "::" },
				{ values: { buf: new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]).buffer }, result: "::1" },
				{ values: { buf: new Uint8Array([0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]).buffer }, result: "1::" },
				{ values: { buf: new Uint8Array([0x20, 0x01, 0x0d, 0xb8, 0, 0, 0, 0, 0, 0, 0xff, 0, 0, 0x42, 0x83, 0x29]).buffer }, result: "2001:db8::ff00:42:8329" },
				// A single zero is not compressed
				{ values: { buf: new Uint8Array([0, 1, 0, 0, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7]).buffer }, result: "1:0:2:3:4:5:6:7" },
				// The longest run is compressed; the leftmost run wins a tie
				{ values: { buf: new Uint8Array([0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 3, 0, 4]).buffer }, result: "1::2:0:0:3:4" },
				{ values: { buf: new Uint8Array([0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 3]).buffer }, result: "1:0:0:2::3" },
				// IPv4 bytes embedded in an IPv6 buffer remain IPv6 text
				{ values: { buf: new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xff, 192, 168, 1, 1]).buffer }, result: "::ffff:c0a8:101" },
				// IPv6 with CIDR
				{ values: { buf: new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]).buffer }, result: "::/0" },
				{ values: { buf: new Uint8Array([0x20, 0x01, 0x0d, 0xb8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 64]).buffer }, result: "2001:db8::1/64" },
				{ values: { buf: new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 128]).buffer }, result: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/128" },
			],
		},
	]);
});

describe("IP matching test", ()=> {
	runAffinirumTests([
		{
			script: "IP.Match([\"192.0.2.1\", \"198.51.100.2\", \"2001:db8::3\"], ip)",
			cases: [
				{ values: { ip: "192.0.2.1" }, result: true },
				{ values: { ip: "198.51.100.2" }, result: true },
				{ values: { ip: "2001:db8::3" }, result: true },
				{ values: { ip: "2001:db8::4" }, result: false },
			]
		},
		{
			script: "IP.Match([\"192.0.2.1\", \"198.51.100.2\", \"2001:db8::3\"], [ip])",
			cases: [
				{ values: { ip: "192.0.2.1" }, result: true },
				{ values: { ip: "198.51.100.2" }, result: true },
				{ values: { ip: "2001:db8::3" }, result: true },
				{ values: { ip: "2001:db8::4" }, result: false },
			]
		},
		{
			script: "IP.Match([\"192.0.2.1\", \"198.51.100.2\", \"2001:db8::3\"], [ip1], ip2)",
			cases: [
				{ values: { ip1: "192.0.2.1", ip2: "2001:db8::4" }, result: true },
				{ values: { ip1: "198.51.100.2", ip2: "2001:db8::4" }, result: true },
				{ values: { ip1: "2001:db8::4", ip2: "2001:db8::3" }, result: true },
			]
		},
		{
			script: "IP.Match([\"192.0.2.1\", \"192.0.2.1\", \"192.0.2.1\"], ip1, [ip2])",
			cases: [
				{ values: { ip1: "192.0.2.1", ip2: "2001:db8::4" }, result: true },
				{ values: { ip1: "198.51.100.2", ip2: "2001:db8::4" }, result: false },
				{ values: { ip1: "2001:db8::4", ip2: "2001:db8::3" }, result: false },
			]
		},
		{
			script: "IP.Match([\"192.0.2.123\"], ip)",
			cases: [
				{ values: { ip: "192.0.2.123" }, result: true },
				{ values: { ip: "192.0.2.122" }, result: false },
				{ values: { ip: "192.0.2.124" }, result: false },
			],
		},
		{
			script: "IP.Match([\"203.0.113.7/32\"], ip)",
			cases: [
				{ values: { ip: "203.0.113.7" }, result: true },
				{ values: { ip: "203.0.113.7/32" }, result: true },
				{ values: { ip: "203.0.113.6" }, result: false },
			],
		},
		{
			script: "IP.Match([\"192.168.10.0/24\"], ip)",
			cases: [
				{ values: { ip: "192.168.10.0" }, result: true },
				{ values: { ip: "192.168.10.1" }, result: true },
				{ values: { ip: "192.168.10.255" }, result: true },
				{ values: { ip: "192.168.9.255" }, result: false },
				{ values: { ip: "192.168.11.0" }, result: false },
			],
		},
		{
			script: "IP.Match([\"192.168.10.237/24\"], ip)",
			cases: [
				{ values: { ip: "192.168.10.0" }, result: true },
				{ values: { ip: "192.168.10.255" }, result: true },
				{ values: { ip: "192.168.11.0" }, result: false },
			],
		},
		{
			script: "IP.Match([\"203.0.113.9/0\"], ip)",
			cases: [
				{ values: { ip: "0.0.0.0" }, result: true },
				{ values: { ip: "192.0.2.1" }, result: true },
				{ values: { ip: "255.255.255.255" }, result: true },
			],
		},
		{
			script: "IP.Match([\"192.0.2.10/31\"], ip)",
			cases: [
				{ values: { ip: "192.0.2.10" }, result: true },
				{ values: { ip: "192.0.2.11" }, result: true },
				{ values: { ip: "192.0.2.9" }, result: false },
				{ values: { ip: "192.0.2.12" }, result: false },
			],
		},
		{
			script: "IP.Match([\"10.0.0.0/8\"], ip)",
			cases: [
				{ values: { ip: "10.20.0.0/16" }, result: true },
				{ values: { ip: "10.20.30.0/24" }, result: true },
				{ values: { ip: "10.20.30.40/32" }, result: true },
			],
		},
		{
			script: "IP.Match([\"10.20.0.0/16\"], ip)",
			cases: [
				{ values: { ip: "10.20.0.0/16" }, result: true },
				{ values: { ip: "10.0.0.0/8" }, result: false },
			],
		},
		{
			script: "IP.Match([\"10.0.0.0/8\", \"172.16.0.0/12\", \"192.168.1.0/24\"], ip)",
			cases: [
				{ values: { ip: "10.255.255.255" }, result: true },
				{ values: { ip: "172.31.255.255" }, result: true },
				{ values: { ip: "192.168.1.200" }, result: true },
				{ values: { ip: "172.32.0.0" }, result: false },
				{ values: { ip: "192.168.2.1" }, result: false },
			],
		},
		{
			script: "IP.Match([\"2001:db8::1234\"], ip)",
			cases: [
				{ values: { ip: "2001:db8::1234" }, result: true },
				{ values: { ip: "2001:db8::1235" }, result: false },
			],
		},
		{
			script: "IP.Match([\"2001:db8::7/128\"], ip)",
			cases: [
				{ values: { ip: "2001:db8::7" }, result: true },
				{ values: { ip: "2001:db8::7/128" }, result: true },
				{ values: { ip: "2001:db8::8" }, result: false },
			],
		},
		{
			script: "IP.Match([\"2001:db8:abcd:1234::/64\"], ip)",
			cases: [
				{ values: { ip: "2001:db8:abcd:1234::" }, result: true },
				{ values: { ip: "2001:db8:abcd:1234:ffff:ffff:ffff:ffff" }, result: true },
				{ values: { ip: "2001:db8:abcd:1233:ffff:ffff:ffff:ffff" }, result: false },
				{ values: { ip: "2001:db8:abcd:1235::" }, result: false },
			],
		},
		{
			script: "IP.Match([\"2001:db8:abcd:1234:dead:beef:cafe:babe/64\"], ip)",
			cases: [
				{ values: { ip: "2001:db8:abcd:1234::" }, result: true },
				{ values: { ip: "2001:db8:abcd:1234:ffff:ffff:ffff:ffff" }, result: true },
				{ values: { ip: "2001:db8:abcd:1235::" }, result: false },
			],
		},
		{
			script: "IP.Match([\"2001:db8::1/0\"], ip)",
			cases: [
				{ values: { ip: "::" }, result: true },
				{ values: { ip: "2001:db8::1" }, result: true },
				{ values: { ip: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff" }, result: true },
			],
		},
		{
			script: "IP.Match([\"2001:db8::10/127\"], ip)",
			cases: [
				{ values: { ip: "2001:db8::10" }, result: true },
				{ values: { ip: "2001:db8::11" }, result: true },
				{ values: { ip: "2001:db8::f" }, result: false },
				{ values: { ip: "2001:db8::12" }, result: false },
			],
		},
		{
			script: "IP.Match([\"2001:0db8:0000:0000:0000:0000:0000:0001\"], ip)",
			cases: [
				{ values: { ip: "2001:db8::1" }, result: true },
			],
		},
		{
			script: "IP.Match([\"2001:db8::/32\"], ip)",
			cases: [
				{ values: { ip: "2001:db8:abcd::/48" }, result: true },
				{ values: { ip: "2001:db8:abcd:1234::/64" }, result: true },
			],
		},
		{
			script: "IP.Match([\"2001:db8:abcd::/48\"], ip)",
			cases: [
				{ values: { ip: "2001:db8:abcd::/48" }, result: true },
				{ values: { ip: "2001:db8::/32" }, result: false },
			],
		},
		{
			script: "IP.Match([\"0.0.0.0/0\"], ip)",
			cases: [
				{ values: { ip: "192.0.2.1" }, result: true },
				{ values: { ip: "::" }, result: false },
				{ values: { ip: "2001:db8::1" }, result: false },
			],
		},
		{
			script: "IP.Match([\"::/0\"], ip)",
			cases: [
				{ values: { ip: "2001:db8::1" }, result: true },
				{ values: { ip: "0.0.0.0" }, result: false },
				{ values: { ip: "192.0.2.1" }, result: false },
			],
		},
	]);
});
