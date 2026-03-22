import { describe, expect, it } from "vitest";
import type { TDGlslPatternEntry } from "../../../src/features/resources/types.js";
import {
	formatGlslPatternDetail,
	formatGlslPatternSearchResults,
} from "../../../src/features/tools/presenter/glslPatternFormatter.js";

function makeEntry(
	overrides: Partial<TDGlslPatternEntry> = {},
): TDGlslPatternEntry {
	return {
		content: {
			summary: "A test GLSL pattern",
			warnings: ["Watch out for GPU cost"],
		},
		id: "test-pattern",
		kind: "glsl-pattern",
		payload: {
			code: {
				glsl: "out vec4 fragColor;\nvoid main() { fragColor = vec4(1.0); }",
			},
			difficulty: "beginner",
			estimatedGpuCost: "low",
			setup: {
				operators: [
					{ family: "TOP", name: "test", role: "primary", type: "glslTOP" },
				],
				uniforms: [
					{
						default: "absTime.seconds",
						description: "Time in seconds",
						name: "uTime",
						type: "float",
					},
				],
			},
			tags: ["test", "basic"],
			type: "pixel",
		},
		provenance: { confidence: "high", license: "MIT", source: "manual" },
		searchKeywords: ["test"],
		title: "Test Pattern",
		...overrides,
	} as TDGlslPatternEntry;
}

describe("formatGlslPatternDetail", () => {
	it("should include title, summary, type, difficulty in markdown", () => {
		const result = formatGlslPatternDetail(makeEntry());
		expect(result).toContain("Test Pattern");
		expect(result).toContain("A test GLSL pattern");
		expect(result).toContain("pixel");
		expect(result).toContain("beginner");
	});

	it("should include GLSL code by default", () => {
		const result = formatGlslPatternDetail(makeEntry());
		expect(result).toContain("fragColor");
		expect(result).toContain("```glsl");
	});

	it("should include setup by default", () => {
		const result = formatGlslPatternDetail(makeEntry());
		expect(result).toContain("glslTOP");
		expect(result).toContain("uTime");
	});

	it("should include warnings", () => {
		const result = formatGlslPatternDetail(makeEntry());
		expect(result).toContain("Watch out for GPU cost");
	});

	it("should omit code when includeCode is false", () => {
		const result = formatGlslPatternDetail(makeEntry(), {
			includeCode: false,
		});
		expect(result).not.toContain("```glsl");
		expect(result).not.toContain("fragColor");
	});

	it("should omit setup when includeSetup is false", () => {
		const result = formatGlslPatternDetail(makeEntry(), {
			includeSetup: false,
		});
		expect(result).not.toContain("glslTOP");
		expect(result).not.toContain("uTime");
	});

	it("should omit code from structured JSON when includeCode is false", () => {
		const result = formatGlslPatternDetail(makeEntry(), {
			includeCode: false,
			responseFormat: "json",
		});
		const parsed = JSON.parse(result);
		expect(parsed.code).toBeUndefined();
		expect(parsed.id).toBe("test-pattern");
	});

	it("should omit setup from structured JSON when includeSetup is false", () => {
		const result = formatGlslPatternDetail(makeEntry(), {
			includeSetup: false,
			responseFormat: "json",
		});
		const parsed = JSON.parse(result);
		expect(parsed.setup).toBeUndefined();
	});

	it("should include code in structured JSON when includeCode is true", () => {
		const result = formatGlslPatternDetail(makeEntry(), {
			includeCode: true,
			responseFormat: "json",
		});
		const parsed = JSON.parse(result);
		expect(parsed.code).toBeDefined();
		expect(parsed.code.glsl).toContain("fragColor");
	});
});

describe("formatGlslPatternSearchResults", () => {
	it("should show result count", () => {
		const entries = [makeEntry({ id: "a", title: "A" })];
		const result = formatGlslPatternSearchResults(entries);
		expect(result).toContain("1 results");
	});

	it("should show entry details", () => {
		const entries = [makeEntry({ id: "noise", title: "Generative Noise" })];
		const result = formatGlslPatternSearchResults(entries);
		expect(result).toContain("Generative Noise");
		expect(result).toContain("noise");
	});

	it("should show empty message when no results", () => {
		const result = formatGlslPatternSearchResults([], { query: "xyz" });
		expect(result).toContain("No GLSL patterns found");
	});

	it("should include query in empty message", () => {
		const result = formatGlslPatternSearchResults([], {
			query: "feedback",
		});
		expect(result).toContain("feedback");
	});
});
