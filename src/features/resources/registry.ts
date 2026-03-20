import type { ILogger } from "../../core/logger.js";
import { loadKnowledgeEntries } from "./loader.js";
import type { TDKnowledgeEntry } from "./types.js";

/**
 * In-memory registry of TD knowledge entries.
 * Supports lookup by ID, filtering by kind, and text search.
 */
export class KnowledgeRegistry {
	private readonly entries = new Map<string, TDKnowledgeEntry>();
	private readonly logger?: ILogger;

	constructor(logger?: ILogger) {
		this.logger = logger;
	}

	get size(): number {
		return this.entries.size;
	}

	/**
	 * Load all knowledge entries from a base directory.
	 * Duplicate IDs are skipped with a warning (first-loaded wins).
	 */
	loadAll(basePath: string): void {
		const loaded = loadKnowledgeEntries(basePath, this.logger);
		for (const entry of loaded) {
			if (this.entries.has(entry.id)) {
				this.logger?.sendLog({
					data: `Duplicate knowledge entry ID "${entry.id}", skipping`,
					level: "warning",
					logger: "KnowledgeRegistry",
				});
				continue;
			}
			this.entries.set(entry.id, entry);
		}
		this.logger?.sendLog({
			data: `Knowledge registry loaded: ${this.entries.size} entry/entries`,
			level: "info",
			logger: "KnowledgeRegistry",
		});
	}

	getById(id: string): TDKnowledgeEntry | undefined {
		return this.entries.get(id);
	}

	getByKind(kind: string): TDKnowledgeEntry[] {
		return [...this.entries.values()].filter((e) => e.kind === kind);
	}

	/**
	 * Search entries by query string.
	 * Kind-aware: searches relevant payload fields per entry type.
	 */
	search(query: string, maxResults = 20): TDKnowledgeEntry[] {
		const q = query.trim().toLowerCase();
		if (!q) return [];

		return [...this.entries.values()]
			.filter((e) => matchesQuery(e, q))
			.slice(0, maxResults);
	}

	/**
	 * Return a lightweight index of all entries (no payload or full content).
	 */
	getIndex(): Array<{ id: string; title: string; kind: string }> {
		return [...this.entries.values()].map((e) => ({
			id: e.id,
			kind: e.kind,
			title: e.title,
		}));
	}

	/**
	 * Return a lightweight index filtered to python-module entries.
	 */
	getModuleIndex(): Array<{ id: string; title: string; kind: string }> {
		return [...this.entries.values()]
			.filter((e) => e.kind === "python-module")
			.map((e) => ({ id: e.id, kind: e.kind, title: e.title }));
	}

	/**
	 * Return a lightweight index filtered to operator entries.
	 */
	getOperatorIndex(): Array<{ id: string; title: string; kind: string }> {
		return [...this.entries.values()]
			.filter((e) => e.kind === "operator")
			.map((e) => ({ id: e.id, kind: e.kind, title: e.title }));
	}
}

function matchesQuery(entry: TDKnowledgeEntry, query: string): boolean {
	const haystacks = [
		entry.id,
		entry.title,
		entry.content.summary,
		...(entry.aliases ?? []),
		...entry.searchKeywords,
	];

	if (entry.kind === "python-module") {
		haystacks.push(entry.payload.canonicalName);
		for (const m of entry.payload.members) {
			haystacks.push(m.name);
		}
	} else if (entry.kind === "operator") {
		haystacks.push(entry.payload.opType);
		haystacks.push(entry.payload.opFamily);
		for (const p of entry.payload.parameters) {
			haystacks.push(p.name);
		}
	}

	return haystacks.some((h) => h.toLowerCase().includes(query));
}
