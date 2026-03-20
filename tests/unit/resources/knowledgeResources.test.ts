import { beforeEach, describe, expect, it, vi } from "vitest";
import { KnowledgeRegistry } from "../../../src/features/resources/registry.js";
import { registerKnowledgeResources } from "../../../src/features/resources/handlers/knowledgeResources.js";
import type { TDKnowledgeEntry } from "../../../src/features/resources/types.js";

function makeEntry(overrides: Partial<TDKnowledgeEntry> = {}): TDKnowledgeEntry {
	return {
		id: "tdfunctions",
		title: "TDFunctions",
		kind: "python-module",
		content: { summary: "Utility module" },
		provenance: { source: "skills-reference", confidence: "high", license: "MIT" },
		searchKeywords: ["createProperty"],
		payload: {
			canonicalName: "TDFunctions",
			accessPattern: "import TDFunctions",
			members: [
				{ name: "createProperty", description: "Creates a property" },
			],
		},
		...overrides,
	} as TDKnowledgeEntry;
}

// Capture registered resource callbacks
type RegisterCall = {
	name: string;
	uriOrTemplate: unknown;
	config: unknown;
	callback: (...args: unknown[]) => unknown;
};

function createMockServer() {
	const registeredResources: RegisterCall[] = [];
	return {
		server: {
			registerResource: vi.fn(
				(name: string, uriOrTemplate: unknown, config: unknown, callback: (...args: unknown[]) => unknown) => {
					registeredResources.push({ name, uriOrTemplate, config, callback });
				},
			),
		},
		registeredResources,
	};
}

describe("registerKnowledgeResources", () => {
	let mockServer: ReturnType<typeof createMockServer>;
	let mockLogger: { sendLog: ReturnType<typeof vi.fn> };
	let registry: KnowledgeRegistry;

	beforeEach(() => {
		vi.clearAllMocks();
		mockServer = createMockServer();
		mockLogger = { sendLog: vi.fn() };

		// Populate registry directly (bypass filesystem)
		registry = new KnowledgeRegistry();
		// Use loadAll with a non-existent path — then manually set entries
		// Instead, we'll create a registry and access its internals
	});

	function setupWithEntries(entries: TDKnowledgeEntry[]) {
		// Create a fresh registry and populate via reflection
		registry = new KnowledgeRegistry();
		const entriesMap = (registry as unknown as { entries: Map<string, TDKnowledgeEntry> }).entries;
		for (const entry of entries) {
			entriesMap.set(entry.id, entry);
		}

		registerKnowledgeResources(
			mockServer.server as never,
			mockLogger as never,
			registry,
		);
	}

	it("should register both static and template resources", () => {
		setupWithEntries([makeEntry()]);

		expect(mockServer.server.registerResource).toHaveBeenCalledTimes(2);

		const [staticCall, templateCall] = mockServer.registeredResources;
		expect(staticCall.name).toBe("TD Module Index");
		expect(staticCall.uriOrTemplate).toBe("td://modules");

		expect(templateCall.name).toBe("TD Module Detail");
		// Template is a ResourceTemplate instance
		expect(typeof templateCall.uriOrTemplate).toBe("object");
	});

	it("td://modules should return versioned index JSON", () => {
		const entry = makeEntry({ id: "tdfunctions", title: "TDFunctions" });
		setupWithEntries([entry]);

		const staticCall = mockServer.registeredResources[0];
		const result = staticCall.callback() as {
			contents: Array<{ uri: string; text: string; mimeType: string }>;
		};

		expect(result.contents).toHaveLength(1);
		expect(result.contents[0].mimeType).toBe("application/json");

		const parsed = JSON.parse(result.contents[0].text);
		expect(parsed.version).toBe("1");
		expect(parsed.entries).toEqual([
			{ id: "tdfunctions", title: "TDFunctions", kind: "python-module" },
		]);
	});

	it("td://modules/{id} should return full entry for known module", () => {
		const entry = makeEntry({ id: "tdfunctions" });
		setupWithEntries([entry]);

		const templateCall = mockServer.registeredResources[1];
		const uri = new URL("td://modules/tdfunctions");
		const variables = { id: "tdfunctions" };
		const result = templateCall.callback(uri, variables) as {
			contents: Array<{ uri: string; text: string; mimeType: string }>;
		};

		expect(result.contents).toHaveLength(1);
		expect(result.contents[0].mimeType).toBe("application/json");

		const parsed = JSON.parse(result.contents[0].text);
		expect(parsed.version).toBe("1");
		expect(parsed.entry.id).toBe("tdfunctions");
		expect(parsed.entry.payload.canonicalName).toBe("TDFunctions");
	});

	it("td://modules/{id} should throw McpError for unknown module", () => {
		setupWithEntries([makeEntry()]);

		const templateCall = mockServer.registeredResources[1];
		const uri = new URL("td://modules/nonexistent");
		const variables = { id: "nonexistent" };

		expect(() => templateCall.callback(uri, variables)).toThrow(
			/Module "nonexistent" not found/,
		);
	});

	it("template list callback should enumerate all modules", async () => {
		const entries = [
			makeEntry({ id: "tdfunctions", title: "TDFunctions" }),
			makeEntry({ id: "tdjson", title: "TDJSON" }),
		];
		setupWithEntries(entries);

		const templateCall = mockServer.registeredResources[1];
		// Access the ResourceTemplate's list callback
		const template = templateCall.uriOrTemplate as { listCallback?: () => Promise<unknown> };
		if (template.listCallback) {
			const listResult = (await template.listCallback()) as {
				resources: Array<{ uri: string; name: string; mimeType: string }>;
			};
			expect(listResult.resources).toHaveLength(2);
			expect(listResult.resources[0].uri).toBe("td://modules/tdfunctions");
			expect(listResult.resources[0].name).toBe("TDFunctions");
		}
	});
});
