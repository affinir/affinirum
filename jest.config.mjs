/** @type {import("jest").Config} */
export default {
	testEnvironment: "node",
	maxWorkers: 4,
	roots: ["<rootDir>/dst/spc/test"],
	testMatch: ["**/*.test.js"],
	setupFiles: ["<rootDir>/dst/spc/util/JestSetup.js"],
	transform: {},
	randomize: true,
	showSeed: true,
	verbose: true,
};
