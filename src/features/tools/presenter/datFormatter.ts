import type {
	DiscoverDatCandidates200Data,
	GetDatText200Data,
	LintDat200Data,
	SetDatText200Data,
} from "../../../gen/endpoints/TouchDesignerAPI.js";
import type { FormatterOptions } from "./responseFormatter.js";
import {
	finalizeFormattedText,
	mergeFormatterOptions,
} from "./responseFormatter.js";

type FormatterOpts = Pick<FormatterOptions, "detailLevel" | "responseFormat">;

export function formatDatText(
	data: GetDatText200Data | undefined,
	options?: FormatterOpts,
): string {
	const opts = mergeFormatterOptions(options);
	if (!data) {
		return finalizeFormattedText("DAT text not available.", opts, {
			context: { title: "DAT Text" },
		});
	}

	const path = data.path ?? "(unknown)";
	const text = data.text ?? "";
	const lineCount = text.split("\n").length;
	const base = `DAT ${path} (${lineCount} lines)`;

	if (opts.detailLevel === "minimal") {
		return finalizeFormattedText(base, opts, {
			context: { title: "DAT Text" },
		});
	}

	const full = `${base}\n---\n${text}`;
	return finalizeFormattedText(full, opts, {
		context: { path, title: "DAT Text" },
		structured: data,
		template: "detailedPayload",
	});
}

export function formatSetDatText(
	data: SetDatText200Data | undefined,
	options?: FormatterOpts,
): string {
	const opts = mergeFormatterOptions(options);
	if (!data) {
		return finalizeFormattedText("DAT text update returned no data.", opts, {
			context: { title: "Set DAT Text" },
		});
	}

	const path = data.path ?? "(unknown)";
	const length = data.length ?? 0;
	const text = `✓ Updated DAT ${path} (${length} characters written)`;

	return finalizeFormattedText(text, opts, {
		context: { path, title: "Set DAT Text" },
		structured: data,
	});
}

export function formatLintDat(
	data: LintDat200Data | undefined,
	options?: FormatterOpts,
): string {
	const opts = mergeFormatterOptions(options);
	if (!data) {
		return finalizeFormattedText("Lint returned no data.", opts, {
			context: { title: "DAT Lint" },
		});
	}

	const path = data.path ?? "(unknown)";
	const count = data.diagnosticCount ?? 0;

	if (count === 0) {
		const text = `✓ ${path}: no lint issues`;
		return finalizeFormattedText(text, opts, {
			context: { path, title: "DAT Lint" },
			structured: data,
		});
	}

	const lines = [`${path}: ${count} issue(s)`];
	if (data.diagnostics && opts.detailLevel !== "minimal") {
		for (const d of data.diagnostics) {
			const loc = `L${d.line ?? "?"}:${d.column ?? "?"}`;
			const fixable = d.fixable ? " (fixable)" : "";
			lines.push(`  ${loc} ${d.code ?? ""} ${d.message ?? ""}${fixable}`);
		}
	}
	if (data.fixed) {
		lines.push("Auto-fix applied.");
	}

	return finalizeFormattedText(lines.join("\n"), opts, {
		context: { path, title: "DAT Lint" },
		structured: data,
		template: opts.detailLevel === "detailed" ? "detailedPayload" : "default",
	});
}

export function formatDiscoverDatCandidates(
	data: DiscoverDatCandidates200Data | undefined,
	options?: FormatterOpts,
): string {
	const opts = mergeFormatterOptions(options);
	if (!data) {
		return finalizeFormattedText("No discovery data returned.", opts, {
			context: { title: "DAT Discover" },
		});
	}

	const parentPath = data.parentPath ?? "(unknown)";
	const count = data.count ?? 0;
	const purpose = data.purpose ?? "any";

	if (count === 0) {
		return finalizeFormattedText(
			`No DAT candidates found under ${parentPath} (purpose=${purpose})`,
			opts,
			{ context: { title: "DAT Discover" } },
		);
	}

	const lines = [`${count} DAT candidate(s) under ${parentPath} [${purpose}]`];
	if (data.candidates && opts.detailLevel !== "minimal") {
		for (const c of data.candidates) {
			const kind = c.kindGuess ?? "?";
			const conf = c.confidence ? ` (${c.confidence})` : "";
			lines.push(`  ${c.path ?? c.name ?? "?"} — ${kind}${conf}`);
		}
	}

	return finalizeFormattedText(lines.join("\n"), opts, {
		context: { parentPath, title: "DAT Discover" },
		structured: data,
		template: opts.detailLevel === "detailed" ? "detailedPayload" : "default",
	});
}
