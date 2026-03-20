import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	ErrorCode,
	McpError,
} from "@modelcontextprotocol/sdk/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ILogger } from "../../../core/logger.js";
import { RESOURCE_URIS } from "../../../core/constants.js";
import type { KnowledgeRegistry } from "../registry.js";

/**
 * Register MCP resources for TD knowledge entries.
 *
 * - td://modules — static index of all python-module entries
 * - td://modules/{id} — detail for a single module
 */
export function registerKnowledgeResources(
	server: McpServer,
	logger: ILogger,
	registry: KnowledgeRegistry,
): void {
	// Static resource: module index
	server.registerResource(
		"TD Module Index",
		RESOURCE_URIS.MODULES_INDEX,
		{ mimeType: "application/json" },
		() => {
			const index = registry.getIndex();
			return {
				contents: [
					{
						uri: RESOURCE_URIS.MODULES_INDEX,
						mimeType: "application/json",
						text: JSON.stringify({ version: "1", entries: index }),
					},
				],
			};
		},
	);

	// Template resource: module detail
	const moduleTemplate = new ResourceTemplate(
		RESOURCE_URIS.MODULE_DETAIL,
		{
			list: async () => ({
				resources: registry.getIndex().map((e) => ({
					uri: `td://modules/${e.id}`,
					name: e.title,
					mimeType: "application/json",
				})),
			}),
		},
	);

	server.registerResource(
		"TD Module Detail",
		moduleTemplate,
		{
			description: "Detailed documentation for a TD Python module",
			mimeType: "application/json",
		},
		(uri, variables) => {
			const id = variables.id as string;
			const entry = registry.getById(id);
			if (!entry) {
				throw new McpError(
					ErrorCode.InvalidParams,
					`Module "${id}" not found`,
				);
			}
			return {
				contents: [
					{
						uri: uri.href,
						mimeType: "application/json",
						text: JSON.stringify({ version: "1", entry }),
					},
				],
			};
		},
	);

	logger.sendLog({
		data: `Registered knowledge resources: ${RESOURCE_URIS.MODULES_INDEX}, ${RESOURCE_URIS.MODULE_DETAIL}`,
		level: "info",
		logger: "registerKnowledgeResources",
	});
}
