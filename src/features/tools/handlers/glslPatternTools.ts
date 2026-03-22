import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TOOL_NAMES } from "../../../core/constants.js";
import { handleToolError } from "../../../core/errorHandling.js";
import type { ILogger } from "../../../core/logger.js";
import type { ServerMode } from "../../../core/serverMode.js";
import type { KnowledgeRegistry } from "../../resources/registry.js";
import type { TDGlslPatternEntry } from "../../resources/types.js";
import {
	formatGlslPatternDetail,
	formatGlslPatternSearchResults,
} from "../presenter/index.js";
import { detailOnlyFormattingSchema } from "../types.js";

// --- Schemas ---

const searchGlslPatternsSchema = detailOnlyFormattingSchema.extend({
	difficulty: z
		.enum(["beginner", "intermediate", "advanced"])
		.describe("Filter by difficulty level")
		.optional(),
	maxResults: z
		.number()
		.int()
		.min(1)
		.max(50)
		.describe("Maximum number of results (default: 10)")
		.optional(),
	query: z
		.string()
		.min(1)
		.describe(
			"Search query — matches against id, title, aliases, summary, tags, type, difficulty",
		)
		.optional(),
	tags: z.array(z.string()).describe("Filter by tags (OR logic)").optional(),
	type: z
		.enum(["pixel", "vertex", "compute", "utility"])
		.describe("Filter by shader type")
		.optional(),
});
type SearchGlslPatternsParams = z.input<typeof searchGlslPatternsSchema>;

const getGlslPatternSchema = detailOnlyFormattingSchema.extend({
	id: z.string().min(1).describe("Pattern ID to retrieve"),
	includeCode: z
		.boolean()
		.describe("Include GLSL source code in response (default: true)")
		.optional(),
	includeSetup: z
		.boolean()
		.describe(
			"Include TD setup instructions (operators, uniforms, connections) in response (default: true)",
		)
		.optional(),
});
type GetGlslPatternParams = z.input<typeof getGlslPatternSchema>;

// --- Local text matching ---

function matchesQuery(entry: TDGlslPatternEntry, query: string): boolean {
	const q = query.toLowerCase();
	const haystacks = [
		entry.id,
		entry.title,
		entry.content.summary,
		...(entry.aliases ?? []),
		...entry.searchKeywords,
		entry.payload.type,
		entry.payload.difficulty,
		...(entry.payload.tags ?? []),
	];
	return haystacks.some((h) => h.toLowerCase().includes(q));
}

// --- Registration ---

export function registerGlslPatternTools(
	server: McpServer,
	logger: ILogger,
	registry: KnowledgeRegistry,
	serverMode: ServerMode,
): void {
	server.tool(
		TOOL_NAMES.SEARCH_GLSL_PATTERNS,
		"Search the catalogue of GLSL shader patterns by type, difficulty, tags, or text query (offline, no TD connection needed)",
		searchGlslPatternsSchema.strict().shape,
		async (params: SearchGlslPatternsParams = {}) => {
			try {
				const {
					detailLevel,
					difficulty,
					maxResults,
					query,
					responseFormat,
					tags,
					type,
				} = params;
				const limit = maxResults ?? 10;

				// Start from all glsl-pattern entries
				let results = registry.getByKind(
					"glsl-pattern",
				) as TDGlslPatternEntry[];

				// Apply filters
				if (type) {
					results = results.filter((e) => e.payload.type === type);
				}
				if (difficulty) {
					results = results.filter((e) => e.payload.difficulty === difficulty);
				}
				if (tags && tags.length > 0) {
					results = results.filter((e) => {
						const entryTags = e.payload.tags ?? [];
						return tags.some((t) => entryTags.includes(t));
					});
				}
				if (query) {
					results = results.filter((e) => matchesQuery(e, query));
				}

				results = results.slice(0, limit);

				const text = formatGlslPatternSearchResults(results, {
					detailLevel: detailLevel ?? "summary",
					query,
					responseFormat,
				});
				return { content: [{ text, type: "text" as const }] };
			} catch (error) {
				return handleToolError(
					error,
					logger,
					TOOL_NAMES.SEARCH_GLSL_PATTERNS,
					undefined,
					serverMode,
				);
			}
		},
	);

	server.tool(
		TOOL_NAMES.GET_GLSL_PATTERN,
		"Get detailed information about a specific GLSL shader pattern by ID, including source code and TD setup (offline, no TD connection needed)",
		getGlslPatternSchema.strict().shape,
		async (params: GetGlslPatternParams) => {
			try {
				const { detailLevel, id, includeCode, includeSetup, responseFormat } =
					params;
				const entry = registry.getById(id);
				if (!entry || entry.kind !== "glsl-pattern") {
					return {
						content: [
							{
								text: `GLSL pattern not found: "${id}". Use search_glsl_patterns to discover available patterns.`,
								type: "text" as const,
							},
						],
						isError: true,
					};
				}
				const text = formatGlslPatternDetail(entry as TDGlslPatternEntry, {
					detailLevel: detailLevel ?? "detailed",
					includeCode: includeCode ?? true,
					includeSetup: includeSetup ?? true,
					responseFormat,
				});
				return { content: [{ text, type: "text" as const }] };
			} catch (error) {
				return handleToolError(
					error,
					logger,
					TOOL_NAMES.GET_GLSL_PATTERN,
					undefined,
					serverMode,
				);
			}
		},
	);
}
