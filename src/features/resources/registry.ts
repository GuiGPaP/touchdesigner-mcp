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
	 * Matches against: id, aliases, searchKeywords, content.summary,
	 * payload.canonicalName, payload.members[].name
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
			title: e.title,
			kind: e.kind,
		}));
	}
}

function matchesQuery(entry: TDKnowledgeEntry, query: string): boolean {
	const haystacks = [
		entry.id,
		entry.title,
		entry.content.summary,
		entry.payload.canonicalName,
		...(entry.aliases ?? []),
		...entry.searchKeywords,
		...entry.payload.members.map((m) => m.name),
	];
	return haystacks.some((h) => h.toLowerCase().includes(query));
}
