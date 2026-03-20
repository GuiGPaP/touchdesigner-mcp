import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { KnowledgeRegistry } from "../../../src/features/resources/registry.js";
import type { TDKnowledgeEntry } from "../../../src/features/resources/types.js";

function makeEntry(overrides: Partial<TDKnowledgeEntry> = {}): TDKnowledgeEntry {
	return {
		id: "test-module",
		title: "TestModule",
		kind: "python-module",
		content: { summary: "A test module" },
		provenance: { source: "manual", confidence: "high", license: "MIT" },
		searchKeywords: ["test"],
		payload: {
			canonicalName: "TestModule",
			members: [
				{ name: "doStuff", description: "Does stuff" },
			],
		},
		...overrides,
	} as TDKnowledgeEntry;
}

function writeTempModule(basePath: string, entry: TDKnowledgeEntry): void {
	const modulesDir = join(basePath, "modules");
	if (!existsSync(modulesDir)) {
		mkdirSync(modulesDir, { recursive: true });
	}
	writeFileSync(
		join(modulesDir, `${entry.id}.json`),
		JSON.stringify(entry),
	);
}

describe("KnowledgeRegistry", () => {
	let tempDir: string;
	const mockLogger = {
		sendLog: vi.fn(),
	};

	beforeEach(() => {
		tempDir = join(tmpdir(), `kr-test-${Date.now()}`);
		mkdirSync(tempDir, { recursive: true });
		vi.clearAllMocks();
	});

	afterEach(() => {
		rmSync(tempDir, { recursive: true, force: true });
	});

	describe("loadAll", () => {
		it("should load valid JSON entries", () => {
			const entry = makeEntry({ id: "tdfunctions" });
			writeTempModule(tempDir, entry);

			const registry = new KnowledgeRegistry(mockLogger);
			registry.loadAll(tempDir);

			expect(registry.size).toBe(1);
			expect(registry.getById("tdfunctions")).toBeDefined();
		});

		it("should skip invalid JSON with warning (fail-soft)", () => {
			const modulesDir = join(tempDir, "modules");
			mkdirSync(modulesDir, { recursive: true });
			writeFileSync(join(modulesDir, "bad.json"), '{"id": 123}');

			const registry = new KnowledgeRegistry(mockLogger);
			registry.loadAll(tempDir);

			expect(registry.size).toBe(0);
			expect(mockLogger.sendLog).toHaveBeenCalledWith(
				expect.objectContaining({ level: "warning" }),
			);
		});

		it("should skip malformed JSON with warning", () => {
			const modulesDir = join(tempDir, "modules");
			mkdirSync(modulesDir, { recursive: true });
			writeFileSync(join(modulesDir, "broken.json"), "{not json");

			const registry = new KnowledgeRegistry(mockLogger);
			registry.loadAll(tempDir);

			expect(registry.size).toBe(0);
			expect(mockLogger.sendLog).toHaveBeenCalledWith(
				expect.objectContaining({ level: "warning" }),
			);
		});

		it("should skip duplicate IDs with warning", () => {
			const entry = makeEntry({ id: "dup" });
			writeTempModule(tempDir, entry);
			// Write a second file with same ID in the same dir
			const modulesDir = join(tempDir, "modules");
			writeFileSync(
				join(modulesDir, "dup-copy.json"),
				JSON.stringify(entry),
			);

			const registry = new KnowledgeRegistry(mockLogger);
			registry.loadAll(tempDir);

			expect(registry.size).toBe(1);
			expect(mockLogger.sendLog).toHaveBeenCalledWith(
				expect.objectContaining({
					level: "warning",
					logger: "KnowledgeRegistry",
				}),
			);
		});
	});

	describe("getById", () => {
		it("should return the entry for a known ID", () => {
			const entry = makeEntry({ id: "tdfunctions", title: "TDFunctions" });
			writeTempModule(tempDir, entry);

			const registry = new KnowledgeRegistry(mockLogger);
			registry.loadAll(tempDir);

			const result = registry.getById("tdfunctions");
			expect(result).toBeDefined();
			expect(result?.title).toBe("TDFunctions");
		});

		it("should return undefined for an unknown ID", () => {
			const registry = new KnowledgeRegistry(mockLogger);
			expect(registry.getById("nonexistent")).toBeUndefined();
		});
	});

	describe("getByKind", () => {
		it("should return all entries matching the kind", () => {
			const entry1 = makeEntry({ id: "mod1" });
			const entry2 = makeEntry({ id: "mod2" });
			writeTempModule(tempDir, entry1);
			writeTempModule(tempDir, entry2);

			const registry = new KnowledgeRegistry(mockLogger);
			registry.loadAll(tempDir);

			const results = registry.getByKind("python-module");
			expect(results).toHaveLength(2);
		});

		it("should return empty array for unknown kind", () => {
			const registry = new KnowledgeRegistry(mockLogger);
			expect(registry.getByKind("unknown")).toEqual([]);
		});
	});

	describe("search", () => {
		it("should match on payload.members[].name", () => {
			const entry = makeEntry({
				id: "tdfunctions",
				payload: {
					canonicalName: "TDFunctions",
					members: [{ name: "createProperty", description: "Creates a property" }],
				},
			});
			writeTempModule(tempDir, entry);

			const registry = new KnowledgeRegistry(mockLogger);
			registry.loadAll(tempDir);

			const results = registry.search("createProperty");
			expect(results).toHaveLength(1);
			expect(results[0].id).toBe("tdfunctions");
		});

		it("should match on payload.canonicalName", () => {
			const entry = makeEntry({
				id: "tdfunctions",
				payload: {
					canonicalName: "TDFunctions",
					members: [{ name: "doStuff", description: "Does stuff" }],
				},
			});
			writeTempModule(tempDir, entry);

			const registry = new KnowledgeRegistry(mockLogger);
			registry.loadAll(tempDir);

			const results = registry.search("TDFunctions");
			expect(results).toHaveLength(1);
		});

		it("should match on searchKeywords", () => {
			const entry = makeEntry({
				id: "tdfunctions",
				searchKeywords: ["property", "layout", "utility"],
			});
			writeTempModule(tempDir, entry);

			const registry = new KnowledgeRegistry(mockLogger);
			registry.loadAll(tempDir);

			const results = registry.search("layout");
			expect(results).toHaveLength(1);
		});

		it("should return empty for empty query", () => {
			const registry = new KnowledgeRegistry(mockLogger);
			expect(registry.search("")).toEqual([]);
			expect(registry.search("  ")).toEqual([]);
		});

		it("should respect maxResults", () => {
			const entry1 = makeEntry({ id: "mod1", searchKeywords: ["test"] });
			const entry2 = makeEntry({ id: "mod2", searchKeywords: ["test"] });
			writeTempModule(tempDir, entry1);
			writeTempModule(tempDir, entry2);

			const registry = new KnowledgeRegistry(mockLogger);
			registry.loadAll(tempDir);

			const results = registry.search("test", 1);
			expect(results).toHaveLength(1);
		});
	});

	describe("getIndex", () => {
		it("should return summaries without payload", () => {
			const entry = makeEntry({
				id: "tdfunctions",
				title: "TDFunctions",
			});
			writeTempModule(tempDir, entry);

			const registry = new KnowledgeRegistry(mockLogger);
			registry.loadAll(tempDir);

			const index = registry.getIndex();
			expect(index).toHaveLength(1);
			expect(index[0]).toEqual({
				id: "tdfunctions",
				title: "TDFunctions",
				kind: "python-module",
			});
			// Ensure no payload or content leaks
			expect(index[0]).not.toHaveProperty("payload");
			expect(index[0]).not.toHaveProperty("content");
		});
	});
});
