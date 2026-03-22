import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { loadKnowledgeEntries } from "../../../src/features/resources/loader.js";
import type { TDKnowledgeEntry } from "../../../src/features/resources/types.js";

/**
 * Contract tests against the real committed corpus in data/td-knowledge/.
 * These ensure that the canonical JSON files remain valid and complete.
 */

const CORPUS_PATH = join(import.meta.dirname, "..", "..", "..", "data", "td-knowledge");
const mockLogger = { sendLog: vi.fn() };

describe("Corpus contract — data/td-knowledge/", () => {
	const entries = loadKnowledgeEntries(CORPUS_PATH, mockLogger);

	it("loads without warnings", () => {
		const warnings = mockLogger.sendLog.mock.calls.filter(
			(c) => c[0].level === "warning",
		);
		expect(warnings).toHaveLength(0);
	});

	describe("python-module entries", () => {
		const modules = entries.filter(
			(e): e is TDKnowledgeEntry & { kind: "python-module" } =>
				e.kind === "python-module",
		);

		const expectedModuleIds = [
			"tdfunctions",
			"tdjson",
			"tdresources",
			"tdstoretools",
		];

		it("contains all 4 expected modules", () => {
			const ids = modules.map((m) => m.id).sort();
			expect(ids).toEqual(expectedModuleIds);
		});

		for (const id of expectedModuleIds) {
			describe(`module: ${id}`, () => {
				const mod = entries.find((e) => e.id === id) as
					| (TDKnowledgeEntry & { kind: "python-module" })
					| undefined;

				it("has non-empty content.warnings", () => {
					expect(mod).toBeDefined();
					expect(mod!.content.warnings).toBeDefined();
					expect(mod!.content.warnings!.length).toBeGreaterThan(0);
				});

				it("has non-empty payload.members", () => {
					expect(mod).toBeDefined();
					expect(mod!.payload.members.length).toBeGreaterThan(0);
				});
			});
		}
	});

	describe("operator entries", () => {
		const operators = entries.filter(
			(e): e is TDKnowledgeEntry & { kind: "operator" } =>
				e.kind === "operator",
		);

		it("contains glsl-top", () => {
			const ids = operators.map((o) => o.id);
			expect(ids).toContain("glsl-top");
		});

		it("glsl-top has kind 'operator'", () => {
			const glslTop = operators.find((o) => o.id === "glsl-top");
			expect(glslTop).toBeDefined();
			expect(glslTop!.kind).toBe("operator");
		});
	});
});
