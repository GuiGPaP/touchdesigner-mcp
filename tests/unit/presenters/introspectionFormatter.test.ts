import { describe, expect, it } from "vitest";
import {
	formatChopChannels,
	formatCompExtensions,
	formatCompleteOpPaths,
	formatDatTableInfo,
	formatParameterSchema,
} from "../../../src/features/tools/presenter/introspectionFormatter";

describe("formatParameterSchema", () => {
	it("handles undefined data", () => {
		expect(formatParameterSchema(undefined)).toContain("No parameter schema");
	});

	it("formats summary with parameters", () => {
		const text = formatParameterSchema(
			{
				nodePath: "/p1/noise1",
				opType: "noiseCHOP",
				count: 1,
				parameters: [
					{ name: "seed", style: "Int", val: 42, min: 0, max: 100, menuNames: [], menuLabels: [] },
				],
			},
			{ detailLevel: "summary" },
		);
		expect(text).toContain("seed");
		expect(text).toContain("Int");
	});

	it("minimal shows only count", () => {
		const text = formatParameterSchema(
			{
				nodePath: "/p1/noise1",
				opType: "noiseCHOP",
				count: 2,
				parameters: [
					{ name: "a", style: "Float", val: 0, menuNames: [], menuLabels: [] },
					{ name: "b", style: "Float", val: 1, menuNames: [], menuLabels: [] },
				],
			},
			{ detailLevel: "minimal" },
		);
		expect(text).toContain("2 parameter(s)");
		expect(text).not.toContain("Float");
	});
});

describe("formatCompleteOpPaths", () => {
	it("handles no matches", () => {
		const text = formatCompleteOpPaths({
			contextNodePath: "/p1/s1",
			prefix: "zzz",
			count: 0,
			truncated: false,
			matches: [],
		});
		expect(text).toContain("No matches");
	});

	it("formats matches", () => {
		const text = formatCompleteOpPaths({
			contextNodePath: "/p1/s1",
			prefix: "noise",
			count: 1,
			truncated: false,
			matches: [
				{ path: "/p1/noise1", name: "noise1", opType: "noiseCHOP", family: "CHOP", relativeRef: "noise1" },
			],
		});
		expect(text).toContain("noise1");
	});
});

describe("formatChopChannels", () => {
	it("formats channel list", () => {
		const text = formatChopChannels({
			nodePath: "/p1/noise1",
			numChannels: 2,
			numSamples: 100,
			sampleRate: 60,
			channels: [{ name: "tx" }, { name: "ty" }],
			truncated: false,
		});
		expect(text).toContain("tx");
		expect(text).toContain("60 Hz");
	});
});

describe("formatDatTableInfo", () => {
	it("formats table dimensions", () => {
		const text = formatDatTableInfo({
			nodePath: "/p1/table1",
			numRows: 3,
			numCols: 2,
			sampleData: [["a", "b"], ["1", "2"]],
			truncatedRows: false,
			truncatedCols: false,
			truncatedCells: false,
		});
		expect(text).toContain("3 rows");
		expect(text).toContain("2 cols");
	});
});

describe("formatCompExtensions", () => {
	it("formats empty extensions", () => {
		const text = formatCompExtensions({
			compPath: "/p1/base1",
			extensions: [],
		});
		expect(text).toContain("no extensions");
	});

	it("formats extension summary", () => {
		const text = formatCompExtensions({
			compPath: "/p1/base1",
			extensions: [
				{
					name: "MyExt",
					methodCount: 3,
					propertyCount: 1,
					methods: [{ name: "doStuff", signature: "(x: int)" }],
					properties: [{ name: "color", type: "str" }],
				},
			],
		});
		expect(text).toContain("MyExt");
		expect(text).toContain("3 methods");
	});
});
