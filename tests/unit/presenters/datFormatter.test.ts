import { describe, expect, it } from "vitest";
import {
	formatLintDat,
	formatLintDats,
} from "../../../src/features/tools/presenter/datFormatter.js";
import type { LintDat200Data, LintDats200Data } from "../../../src/gen/endpoints/TouchDesignerAPI.js";

describe("datFormatter", () => {
	describe("formatLintDat", () => {
		it("should show diff for dry-run", () => {
			const data: LintDat200Data = {
				path: "/project1/script1",
				name: "script1",
				diagnosticCount: 1,
				diagnostics: [
					{
						code: "F401",
						message: "unused import",
						line: 1,
						column: 1,
						fixable: true,
					},
				],
				fixed: true,
				applied: false,
				diff: "--- /project1/script1 (original)\n+++ /project1/script1 (fixed)\n@@ -1 +0,0 @@\n-import os\n",
				remainingDiagnosticCount: 0,
				remainingDiagnostics: [],
			};

			const result = formatLintDat(data);

			expect(result).toContain("[DRY RUN] Fix preview:");
			expect(result).toContain("import os");
			expect(result).toContain("0 remaining issues after fix.");
		});

		it("should show remaining diagnostics after fix", () => {
			const data: LintDat200Data = {
				path: "/project1/script1",
				name: "script1",
				diagnosticCount: 2,
				diagnostics: [
					{
						code: "F401",
						message: "unused import",
						line: 1,
						column: 1,
						fixable: true,
					},
					{
						code: "E711",
						message: "comparison to None",
						line: 3,
						column: 5,
						fixable: false,
					},
				],
				fixed: true,
				applied: true,
				remainingDiagnosticCount: 1,
				remainingDiagnostics: [
					{
						code: "E711",
						message: "comparison to None",
						line: 3,
						column: 5,
						fixable: false,
					},
				],
			};

			const result = formatLintDat(data);

			expect(result).toContain("Auto-fix applied.");
			expect(result).toContain("Remaining after fix: 1 issue(s)");
			expect(result).toContain("E711");
		});

		it("should show applied fix with zero remaining", () => {
			const data: LintDat200Data = {
				path: "/project1/script1",
				name: "script1",
				diagnosticCount: 1,
				diagnostics: [
					{
						code: "F401",
						message: "unused import",
						line: 1,
						column: 1,
						fixable: true,
					},
				],
				fixed: true,
				applied: true,
				remainingDiagnosticCount: 0,
				remainingDiagnostics: [],
			};

			const result = formatLintDat(data);

			expect(result).toContain("Auto-fix applied.");
			expect(result).toContain("0 remaining issues after fix.");
			expect(result).not.toContain("[DRY RUN]");
		});
	});

	describe("formatLintDats", () => {
		it("should show summary for batch lint with multiple DATs", () => {
			const data: LintDats200Data = {
				parentPath: "/project1",
				summary: {
					totalDatsScanned: 3,
					datsWithErrors: 2,
					datsClean: 1,
					totalIssues: 5,
					fixableCount: 3,
					manualCount: 2,
					bySeverity: { error: 2, warning: 1, info: 2 },
					worstOffenders: [
						{ path: "/project1/script1", name: "script1", diagnosticCount: 3 },
						{ path: "/project1/script2", name: "script2", diagnosticCount: 2 },
					],
				},
				results: [
					{
						path: "/project1/script1",
						name: "script1",
						diagnosticCount: 3,
						diagnostics: [
							{ code: "F401", message: "unused import", line: 1, column: 1, fixable: true },
						],
					},
					{
						path: "/project1/script2",
						name: "script2",
						diagnosticCount: 2,
						diagnostics: [],
					},
					{
						path: "/project1/script3",
						name: "script3",
						diagnosticCount: 0,
						diagnostics: [],
					},
				],
			};

			const result = formatLintDats(data, { detailLevel: "summary" });

			expect(result).toContain("3 DAT(s) scanned");
			expect(result).toContain("Issues: 5");
			expect(result).toContain("fixable: 3");
			expect(result).toContain("manual: 2");
			expect(result).toContain("DATs with errors: 2");
			expect(result).toContain("clean: 1");
			expect(result).toContain("errors=2");
			expect(result).toContain("warnings=1");
			expect(result).toContain("Worst offenders:");
			expect(result).toContain("script1");
			expect(result).toContain("3 issues");
		});

		it("should show detailed per-DAT breakdown in YAML for detailed mode", () => {
			const data: LintDats200Data = {
				parentPath: "/project1",
				summary: {
					totalDatsScanned: 2,
					datsWithErrors: 1,
					datsClean: 1,
					totalIssues: 1,
					fixableCount: 1,
					manualCount: 0,
					bySeverity: { error: 0, warning: 0, info: 1 },
					worstOffenders: [],
				},
				results: [
					{
						path: "/project1/script1",
						name: "script1",
						diagnosticCount: 1,
						diagnostics: [
							{ code: "F401", message: "unused import", line: 1, column: 1, fixable: true },
						],
					},
					{
						path: "/project1/script2",
						name: "script2",
						diagnosticCount: 0,
						diagnostics: [],
					},
				],
			};

			const result = formatLintDats(data, { detailLevel: "detailed" });

			// Detailed mode uses YAML serialization
			expect(result).toContain("F401");
			expect(result).toContain("unused import");
			expect(result).toContain("diagnosticCount");
		});

		it("should handle no data", () => {
			const result = formatLintDats(undefined);
			expect(result).toContain("Batch lint returned no data.");
		});
	});
});
