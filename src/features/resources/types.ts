import { z } from "zod";

// ── Shared schemas ──────────────────────────────────────────────────

const provenanceSchema = z.object({
	confidence: z.enum(["high", "medium", "low"]),
	license: z.string(),
	source: z.enum(["skills-reference", "td-docs", "manual"]),
});

const contentSchema = z.object({
	summary: z.string(),
	warnings: z.array(z.string()).optional(),
});

const knowledgeEntryBaseSchema = z.object({
	aliases: z.array(z.string()).optional(),
	content: contentSchema,
	id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
	provenance: provenanceSchema,
	searchKeywords: z.array(z.string()),
	title: z.string(),
});

// ── Python module schemas ───────────────────────────────────────────

const moduleParameterSchema = z.object({
	default: z.string().optional(),
	description: z.string(),
	name: z.string(),
	type: z.string().optional(),
});

const exampleSchema = z.object({
	code: z.string(),
	label: z.string().optional(),
	language: z.string().default("python"),
});

const moduleMemberSchema = z.object({
	description: z.string(),
	examples: z.array(exampleSchema).optional(),
	name: z.string(),
	parameters: z.array(moduleParameterSchema).optional(),
	returns: z.string().optional(),
	signature: z.string().optional(),
	warnings: z.array(z.string()).optional(),
});

const pythonModulePayloadSchema = z.object({
	accessPattern: z.string().optional(),
	canonicalName: z.string(),
	members: z.array(moduleMemberSchema),
});

const pythonModuleEntrySchema = knowledgeEntryBaseSchema.extend({
	kind: z.literal("python-module"),
	payload: pythonModulePayloadSchema,
});

// ── Operator schemas ────────────────────────────────────────────────

const staticOperatorParamSchema = z.object({
	default: z.unknown().optional(),
	description: z.string().optional(),
	label: z.string().optional(),
	name: z.string(),
	style: z.string().optional(),
});

const operatorPayloadSchema = z.object({
	opFamily: z.string(),
	opType: z.string(),
	parameters: z.array(staticOperatorParamSchema),
});

const operatorEntrySchema = knowledgeEntryBaseSchema.extend({
	kind: z.literal("operator"),
	payload: operatorPayloadSchema,
});

// ── Enriched operator schemas (post-merge with live data) ───────────

export const enrichedStaticOperatorParamSchema =
	staticOperatorParamSchema.extend({
		clampMax: z.boolean().optional(),
		clampMin: z.boolean().optional(),
		max: z.number().nullable().optional(),
		menuLabels: z.array(z.string()).optional(),
		menuNames: z.array(z.string()).optional(),
		min: z.number().nullable().optional(),
		val: z.unknown().optional(),
	});

export const liveParameterSchema = z.object({
	clampMax: z.boolean().optional(),
	clampMin: z.boolean().optional(),
	default: z.unknown().optional(),
	isOP: z.boolean().optional(),
	label: z.string().optional(),
	max: z.number().nullable().optional(),
	menuLabels: z.array(z.string()).optional(),
	menuNames: z.array(z.string()).optional(),
	min: z.number().nullable().optional(),
	name: z.string().optional(),
	page: z.string().optional(),
	readOnly: z.boolean().optional(),
	style: z.string().optional(),
	val: z.unknown().optional(),
});

export const enrichmentMetaSchema = z.object({
	enrichedAt: z.string().optional(),
	liveFields: z.array(z.string()).optional(),
	source: z.enum(["static", "live", "hybrid"]),
	tdBuild: z.string().nullable().optional(),
});

// ── Discriminated union ─────────────────────────────────────────────

export const knowledgeEntrySchema = z.discriminatedUnion("kind", [
	pythonModuleEntrySchema,
	operatorEntrySchema,
]);

// ── Exported types ──────────────────────────────────────────────────

export type TDKnowledgeEntry = z.infer<typeof knowledgeEntrySchema>;
export type TDPythonModuleEntry = z.infer<typeof pythonModuleEntrySchema>;
export type TDOperatorEntry = z.infer<typeof operatorEntrySchema>;
export type EnrichmentMeta = z.infer<typeof enrichmentMetaSchema>;
export type EnrichedStaticOperatorParam = z.infer<
	typeof enrichedStaticOperatorParamSchema
>;
export type LiveParameter = z.infer<typeof liveParameterSchema>;

export interface EnrichedOperatorEntry
	extends Omit<TDOperatorEntry, "payload"> {
	payload: {
		opType: string;
		opFamily: string;
		parameters: EnrichedStaticOperatorParam[];
		liveParameters?: LiveParameter[];
	};
}
