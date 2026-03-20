import { z } from "zod";

const provenanceSchema = z.object({
	source: z.enum(["skills-reference", "td-docs", "manual"]),
	confidence: z.enum(["high", "medium", "low"]),
	license: z.string(),
});

const parameterSchema = z.object({
	name: z.string(),
	type: z.string().optional(),
	default: z.string().optional(),
	description: z.string(),
});

const exampleSchema = z.object({
	code: z.string(),
	label: z.string().optional(),
	language: z.string().default("python"),
});

const moduleMemberSchema = z.object({
	name: z.string(),
	signature: z.string().optional(),
	returns: z.string().optional(),
	description: z.string(),
	parameters: z.array(parameterSchema).optional(),
	examples: z.array(exampleSchema).optional(),
	warnings: z.array(z.string()).optional(),
});

const pythonModulePayloadSchema = z.object({
	canonicalName: z.string(),
	accessPattern: z.string().optional(),
	members: z.array(moduleMemberSchema),
});

export const knowledgeEntrySchema = z.object({
	id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
	title: z.string(),
	kind: z.literal("python-module"),
	aliases: z.array(z.string()).optional(),
	content: z.object({
		summary: z.string(),
		warnings: z.array(z.string()).optional(),
	}),
	provenance: provenanceSchema,
	searchKeywords: z.array(z.string()),
	payload: pythonModulePayloadSchema,
});

export type TDKnowledgeEntry = z.infer<typeof knowledgeEntrySchema>;
