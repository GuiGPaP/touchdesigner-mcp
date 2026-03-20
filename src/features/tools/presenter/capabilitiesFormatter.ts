import type { GetCapabilities200ResponseData } from "../../../gen/endpoints/TouchDesignerAPI.js";
import type { FormatterOptions } from "./responseFormatter.js";
import {
	finalizeFormattedText,
	mergeFormatterOptions,
} from "./responseFormatter.js";

type FormatterOpts = Pick<FormatterOptions, "detailLevel" | "responseFormat">;

export function formatCapabilities(
	data: GetCapabilities200ResponseData | undefined,
	options?: FormatterOpts,
): string {
	const opts = mergeFormatterOptions(options);
	if (!data) {
		return finalizeFormattedText("Capabilities not available.", opts, {
			context: { title: "Capabilities" },
		});
	}

	const lintDat = data.lint_dat ?? false;
	const formatDat = data.format_dat ?? false;
	const typecheckDat = data.typecheck_dat ?? false;
	const ruff = data.tools?.ruff;
	const pyright = data.tools?.pyright;

	if (opts.detailLevel === "minimal") {
		const parts: string[] = [];
		parts.push(`lint_dat=${lintDat}`);
		if (ruff?.installed && ruff.version) {
			parts.push(`ruff=${ruff.version}`);
		}
		if (pyright?.installed && pyright.version) {
			parts.push(`pyright=${pyright.version}`);
		}
		return finalizeFormattedText(parts.join(", "), opts, {
			context: { title: "Capabilities" },
		});
	}

	const lines: string[] = ["Features:"];
	lines.push(`  lint_dat: ${lintDat}`);
	lines.push(`  format_dat: ${formatDat}`);
	lines.push(`  typecheck_dat: ${typecheckDat}`);
	lines.push("Tools:");
	lines.push(
		`  ruff: ${ruff?.installed ? `installed (${ruff.version ?? "unknown version"})` : "not installed"}`,
	);
	lines.push(
		`  pyright: ${pyright?.installed ? `installed (${pyright.version ?? "unknown version"})` : "not installed"}`,
	);

	return finalizeFormattedText(lines.join("\n"), opts, {
		context: { title: "Capabilities" },
		structured: data,
		template: opts.detailLevel === "detailed" ? "detailedPayload" : "default",
	});
}
