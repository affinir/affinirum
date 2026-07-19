import { runAffinirumTests } from "../../helpers/AffinirumTest.js";

describe("JSON function test", ()=> {
	runAffinirumTests([
		{
			script: "JSON.Parse(str1).prop1+JSON.Parse(str2).prop2",
			cases: [
				{ values: { str1: "{\"prop1\":1}", str2: "{\"prop2\":20}" }, result: 21 },
			],
		},
		{
			script: "JSON.Parse(str1)+JSON.Parse(str2)",
			cases: [
				{ values: { str1: "\"p1\"", str2: "\"p2\"" }, result: "p1p2" },
			],
		},
		{
			script: "JSON.Parse(str1)",
			cases: [
				{ values: { str1: undefined }, result: undefined },
				{ values: { str1: null }, result: undefined },
			],
		},
		{
			script: "JSON.Format(obj1)+JSON.Format(obj2)",
			cases: [
				{ values: { obj1: { p1: "a" }, obj2: { p2: "b" } }, result: "{\"p1\":\"a\"}{\"p2\":\"b\"}" }],
		},
		{
			script: "JSON.Format(obj1)",
			cases: [
				{ values: { obj1: undefined }, result: "" },
				{ values: { obj1: null }, result: "" },
				{ values: { obj1: { p1: "a" } }, result: "{\"p1\":\"a\"}" },
			],
		},
	]);
});
