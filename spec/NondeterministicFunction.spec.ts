import { runAffinirumTests } from "./helpers/AffinirumTest.js";

describe("Nondeterministic function test", ()=> {
	runAffinirumTests([
		{
			script: "Integer.Random(1000000) == Integer.Random(1000000)",
			cases: [
				{ result: false },
			],
		},
		{
			script: "Float.Random(1000000.0) == Float.Random(1000000.0)",
			cases: [
				{ result: false },
			],
		},
		{
			script: "String.Random(20) == String.Random(20)",
			cases: [
				{ result: false },
			],
		},
	]);
});
