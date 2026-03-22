import type { TDGlslPatternEntry } from "../../resources/types.js";
import type { FormatterOptions } from "./responseFormatter.js";
import {
	finalizeFormattedText,
	mergeFormatterOptions,
} from "./responseFormatter.js";

type FormatterOpts = Pick<FormatterOptions, "detailLevel" | "responseFormat">;

interface PatternDetailOptions extends FormatterOpts {
	includeCode?: boolean;
	includeSetup?: boolean;
}

/**
 * Format a single GLSL pattern for the get_glsl_pattern tool response.
 * includeCode and includeSetup flags apply to BOTH markdown text AND structured output.
 */
export function formatGlslPatternDetail(
	entry: TDGlslPatternEntry,
	options?: PatternDetailOptions,
): string {
	const opts = mergeFormatterOptions(options);
	const includeCode = options?.includeCode ?? true;
	const includeSetup = options?.includeSetup ?? true;
	const p = entry.payload;

	const lines: string[] = [`# ${entry.title}`, "", entry.content.summary, ""];

	lines.push(`- **ID:** ${entry.id}`);
	lines.push(`- **Type:** ${p.type}`);
	lines.push(`- **Difficulty:** ${p.difficulty}`);
	if (p.estimatedGpuCost) {
		lines.push(`- **GPU Cost:** ${p.estimatedGpuCost}`);
	}
	if (p.minVersion) {
		lines.push(`- **Min TD Version:** ${p.minVersion}`);
	}
	if (p.tags && p.tags.length > 0) {
		lines.push(`- **Tags:** ${p.tags.join(", ")}`);
	}

	if (entry.content.warnings && entry.content.warnings.length > 0) {
		lines.push("", "## Warnings");
		for (const w of entry.content.warnings) {
			lines.push(`- ${w}`);
		}
	}

	if (includeCode) {
		lines.push("", "## GLSL Code", "", "```glsl", p.code.glsl, "```");
		if (p.code.vertexGlsl) {
			lines.push(
				"",
				"## Vertex Shader",
				"",
				"```glsl",
				p.code.vertexGlsl,
				"```",
			);
		}
	}

	if (includeSetup) {
		lines.push("", "## Setup");
		if (p.setup.operators.length > 0) {
			lines.push("", "### Operators");
			for (const op of p.setup.operators) {
				const role = op.role ? ` (${op.role})` : "";
				lines.push(`- **${op.name}**: ${op.type} [${op.family}]${role}`);
			}
		}
		if (p.setup.uniforms && p.setup.uniforms.length > 0) {
			lines.push("", "### Uniforms");
			for (const u of p.setup.uniforms) {
				const def = u.default ? ` = ${u.default}` : "";
				const desc = u.description ? ` — ${u.description}` : "";
				lines.push(`- **${u.name}**: ${u.type}${def}${desc}`);
			}
		}
		if (p.setup.connections && p.setup.connections.length > 0) {
			lines.push("", "### Connections");
			for (const c of p.setup.connections) {
				const idx =
					c.inputIndex !== undefined ? ` (input ${c.inputIndex})` : "";
				lines.push(`- ${c.from} → ${c.to}${idx}`);
			}
		}
	}

	// Build structured output — flags apply here too
	const structured: Record<string, unknown> = {
		difficulty: p.difficulty,
		id: entry.id,
		summary: entry.content.summary,
		title: entry.title,
		type: p.type,
	};
	if (p.estimatedGpuCost) structured.estimatedGpuCost = p.estimatedGpuCost;
	if (p.tags) structured.tags = p.tags;
	if (p.minVersion) structured.minVersion = p.minVersion;
	if (entry.content.warnings) structured.warnings = entry.content.warnings;
	if (includeCode) structured.code = p.code;
	if (includeSetup) structured.setup = p.setup;

	return finalizeFormattedText(lines.join("\n"), opts, {
		context: { title: `GLSL Pattern: ${entry.title}` },
		structured,
	});
}

/**
 * Format GLSL pattern search results for the search_glsl_patterns tool response.
 */
export function formatGlslPatternSearchResults(
	entries: TDGlslPatternEntry[],
	options?: FormatterOpts & { query?: string },
): string {
	const opts = mergeFormatterOptions(options);

	if (entries.length === 0) {
		const hint = options?.query
			? `No GLSL patterns found for "${options.query}".`
			: "No GLSL patterns found matching the given filters.";
		return finalizeFormattedText(hint, opts);
	}

	const lines: string[] = [`# GLSL Patterns (${entries.length} results)`, ""];

	for (const entry of entries) {
		const p = entry.payload;
		const tags = p.tags?.length ? ` [${p.tags.join(", ")}]` : "";
		lines.push(
			`- **${entry.title}** (\`${entry.id}\`) — ${p.type} | ${p.difficulty}${tags}`,
		);
		lines.push(`  ${entry.content.summary}`);
	}

	const structured = entries.map((e) => ({
		difficulty: e.payload.difficulty,
		id: e.id,
		summary: e.content.summary,
		title: e.title,
		type: e.payload.type,
	}));

	return finalizeFormattedText(lines.join("\n"), opts, {
		context: { query: options?.query, resultCount: entries.length },
		structured,
	});
}
