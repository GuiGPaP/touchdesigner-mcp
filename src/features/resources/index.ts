import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ILogger } from "../../core/logger.js";
import type { ServerMode } from "../../core/serverMode.js";
import type { TouchDesignerClient } from "../../tdClient/touchDesignerClient.js";
import { FusionService } from "./fusionService.js";
import { registerKnowledgeResources } from "./handlers/knowledgeResources.js";
import { registerOperatorResources } from "./handlers/operatorResources.js";
import { resolveKnowledgePath } from "./paths.js";
import { KnowledgeRegistry } from "./registry.js";

export function registerResources(
	server: McpServer,
	logger: ILogger,
	tdClient: TouchDesignerClient,
	serverMode: ServerMode,
): KnowledgeRegistry {
	const registry = new KnowledgeRegistry(logger);
	const path = resolveKnowledgePath(import.meta.url);
	if (path) {
		registry.loadAll(path);
	} else {
		logger.sendLog({
			data: "Knowledge base path not found — resources will be empty. Check TD_MCP_KNOWLEDGE_PATH or verify data/td-knowledge/ exists.",
			level: "warning",
			logger: "registerResources",
		});
	}

	const fusionService = new FusionService(
		registry,
		tdClient,
		serverMode,
		logger,
	);

	registerKnowledgeResources(server, logger, registry);
	registerOperatorResources(server, logger, registry, fusionService);

	return registry;
}
