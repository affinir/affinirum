import { runAffinirumTests } from "../../util/AffinirumTest.js";

describe("String function test", () => {
	runAffinirumTests([
		{
			script: "a.Like(b)",
			cases: [
				{ values: { a: "   Abcd  0123  !", b: "abcd-0123 " }, result: true },
				{ values: { a: "ab", b: "ba" }, result: false },
				{ values: { a: "ab", b: "abc" }, result: false },
				{ values: { a: "abc", b: "ab" }, result: false },
				{ values: { a: "", b: "a" }, result: false },
				{ values: { a: "a", b: "" }, result: false },
				{ values: { a: "ab", b: "AB ! " }, result: true },
				{ values: { a: "", b: " - " }, result: true },
				{ values: { a: "İ-K", b: "i k" }, result: true },
			],
		},
		{
			script: "a.NotLike(b)",
			cases: [
				{ values: { a: "  abcd  0123  !", b: "abcd-00123  " }, result: true },
				{ values: { a: "  abcd  0123  ! ", b: "Ab cD-0123  " }, result: false },
				{ values: { a: "ab", b: "abc" }, result: true },
				{ values: { a: "abc", b: "ab" }, result: true },
				{ values: { a: "", b: "a" }, result: true },
				{ values: { a: "ab", b: "AB ! " }, result: false },
				{ values: { a: "", b: " - " }, result: false },
			],
		},
		{
			script: "v.StartsWith(str0, pos, true)",
			cases: [
				{ values: { v: "", str0: "", pos: undefined }, result: true },
				{ values: { v: "", str0: "123", pos: 0n }, result: false },
				{ values: { v: "  ab CD  0123   ", str0: " A++Bcd ", pos: undefined }, result: true },
				{ values: { v: "ab CD  0123   ", str0: "abcd", pos: 2n }, result: false },
				{ values: { v: "abc", str0: "a", pos: 100n }, result: false },
				{ values: { v: "abc", str0: "cd", pos: 2n }, result: false },
				{ values: { v: "a", str0: " a ", pos: 0n }, result: true },
				{ values: { v: "x a-b", str0: "ab", pos: 2n }, result: true },
				{ values: { v: "abc", str0: "a", pos: -4n }, result: true },
				{ values: { v: "", str0: " - ", pos: 100n }, result: true },
				{ values: { v: "İa b", str0: "ab", pos: 1n }, result: true },
			],
		},
		{
			script: "v.StartsWith(str0, pos)",
			cases: [
				{ values: { v: "abcdef", str0: "abc", pos: undefined }, result: true },
				{ values: { v: "abcdef", str0: "bcd", pos: 1n }, result: true },
				{ values: { v: "abcdef", str0: "ABC", pos: undefined }, result: false },
			],
		},
		{
			script: "v.EndsWith(str0, pos, true,) & true",
			cases: [
				{ values: { v: "", str0: "", pos: undefined }, result: true },
				{ values: { v: "", str0: "123", pos: 0n }, result: false },
				{ values: { v: " ab CD  01+2+ 3 ", str0: " 0123 ", pos: undefined }, result: true },
				{ values: { v: " abcdeeeeeef 123", str0: "123", pos: 7n }, result: false },
				{ values: { v: "abc", str0: "c", pos: 0n }, result: false },
				{ values: { v: "abc", str0: "za", pos: 1n }, result: false },
				{ values: { v: "a", str0: " a ", pos: 1n }, result: true },
				{ values: { v: "x a-b", str0: "a", pos: 3n }, result: true },
				{ values: { v: "x a-b", str0: "a", pos: -2n }, result: true },
				{ values: { v: "", str0: " - ", pos: -1n }, result: true },
				{ values: { v: "İa", str0: "i", pos: 1n }, result: true },
			],
		},
		{
			script: "v.EndsWith(str0, pos)",
			cases: [
				{ values: { v: "abcdef", str0: "def", pos: undefined }, result: true },
				{ values: { v: "abcdef", str0: "cde", pos: 5n }, result: true },
				{ values: { v: "abcdef", str0: "DEF", pos: undefined }, result: false },
			],
		},
		{
			script: "String.Decode(v.Encode(enc), enc)",
			cases: [
				{ values: { v: "", enc: "utf8" }, result: "" },
				{ values: { v: "1055", enc: "utf8" }, result: "1055" },
				{ values: { v: "1055", enc: "ucs2" }, result: "1055" },
				{ values: { v: "1055", enc: "ucs2le" }, result: "1055" },
			],
		},
		{
			script: "String.Decode(v, enc, offset, length)",
			cases: [
				{ values: { v: undefined, enc: undefined, offset: undefined, length: undefined }, result: undefined },
				{ values: { v: null, enc: undefined, offset: undefined, length: undefined }, result: undefined },
				{ values: { v: new Uint8Array([0x61, 0x62, 0x63, 0x64]).buffer, enc: "utf8", offset: 1n, length: 2n }, result: "bc" },
				{ values: { v: new Uint8Array([0x00, 0x61, 0x00, 0x62]).buffer, enc: "ucs2", offset: 2n, length: 2n }, result: "b" },
			],
		},
		{
			script: "String.Alphanumeric(a)",
			cases: [
				{ values: { a: "---abcd===" }, result: "abcd" },
				{ values: { a: "+abc-def!" }, result: "abcdef" },
				{ values: { a: "" }, result: undefined },
			],
		},
		{
			script: "str1.Trim() + str2.TrimStart() + str3.TrimEnd()",
			cases: [
				{ values: { str1: " abcd ", str2: "  a", str3: "0  " }, result: "abcda0" },
			],
		},
		{
			script: "x.UpperCase()",
			cases: [
				{ values: { x: "abc" }, result: "ABC" },
				{ values: { x: "aBc 123" }, result: "ABC 123" },
			],
		},
		{
			script: "x.Trim.LowerCase()",
			cases: [
				{ values: { x: "  ABC  " }, result: "abc" },
				{ values: { x: "ABCD  " }, result: "abcd" },
			],
		},
		{
			script: "s.Char(p)",
			cases: [
				{ values: { s: "my long string", p: 1n }, result: "y" },
				{ values: { s: "my+", p: 0n }, result: "m" },
				{ values: { s: "1", p: 1n }, result: "" },
				{ values: { s: "abc", p: -1n }, result: "c" },
			],
		},
		{
			script: "s.CharCode(p) == c",
			cases: [
				{ values: { s: "abc", p: 1n, c: 98 }, result: true },
				{ values: { s: "abc", p: -1n, c: 99 }, result: true },
			],
		},
		{
			script: "str0.Char(2) == \"a\"",
			cases: [
				{ values: { str0: "bca" }, result: true },
				{ values: { str0: "bce" }, result: false },
			],
		},
		{
			script: "v.Split()[i]",
			cases: [
				{ values: { v: "The quick brown fox", i: 2n }, result: "brown" },
				{ values: { v: "The quick brown fox", i: 0n }, result: "The" },
			],
		},
		{
			script: "v.Split(s)[i]",
			cases: [
				{ values: { v: "The quick brown fox", s: " ", i: 2n }, result: "brown" },
				{ values: { v: "The~quick~brown~~fox", s: "~", i: 1n }, result: "quick" },
			],
		},
		{
			script: "v.ReplaceWith(r, s)",
			cases: [
				{ values: { v: "The quick brown fox", s: " ", r: "-" }, result: "The-quick-brown-fox" },
				{ values: { v: "The~quick~brown~fox", s: "~", r: " " }, result: "The quick brown fox" },
			],
		},
		{
			script: "v.ReplaceWith(r, s1, s2)",
			cases: [
				{ values: { v: "a+b-c", r: "", s1: "+", s2: "-" }, result: "abc" },
			],
		},
		{
			script: "v.ReplaceWith('', [s], '!')",
			cases: [
				{ values: { v: "The quick brown fox", s: " " }, result: "Thequickbrownfox" },
				{ values: { v: "The~quick~brown~fox", s: "~" }, result: "Thequickbrownfox" },
			],
		},
		{
			script: "String.Random(c).Length()",
			cases: [
				{ values: { c: 0n }, result: 0n },
				{ values: { c: 8n }, result: 8n },
			],
		},
	]);
});
