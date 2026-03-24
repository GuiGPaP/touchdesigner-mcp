import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ILogger } from "../../core/logger.js";
import type { ServerMode } from "../../core/serverMode.js";
import type { TouchDesignerClient } from "../../tdClient/index.js";
import type { KnowledgeRegistry } from "../resources/registry.js";
import {
	resolveBuiltinAssetsPath,
	resolveProjectAssetsPath,
	resolveUserAssetsPath,
} from "../templates/paths.js";
import { AssetRegistry } from "../templates/registry.js";
import type { AssetSource } from "../templates/types.js";
import { registerAssetTools } from "./handlers/assetTools.js";
import { registerGlslPatternTools } from "./handlers/glslPatternTools.js";
import { registerHealthTools } from "./handlers/healthTools.js";
import { registerTdTools } from "./handlers/tdTools.js";

/**
 * Register tool handlers with MCP server
 */
export function registerTools(
	server: McpServer,
	logger: ILogger,
	tdClient: TouchDesignerClient,
	serverMode: ServerMode,
	knowledgeRegistry: KnowledgeRegistry,
): { assetRegistry: AssetRegistry } {
	registerTdTools(server, logger, tdClient, serverMode);
	registerHealthTools(server, logger, tdClient, serverMode);

	// Initialize asset registry with discovered paths
	const assetRegistry = new AssetRegistry(logger);
	const assetPaths: Array<{ path: string; source: AssetSource }> = [];

	const builtinPath = resolveBuiltinAssetsPath(import.meta.url);
	if (builtinPath) {
		assetPaths.push({ path: builtinPath, source: "builtin" });
	}

	const userPath = resolveUserAssetsPath();
	if (userPath) {
		assetPaths.push({ path: userPath, source: "user" });
	}

	const projectPath = resolveProjectAssetsPath();
	if (projectPath) {
		assetPaths.push({ path: projectPath, source: "project" });
	}

	assetRegistry.loadAll(assetPaths);

	registerAssetTools(server, logger, tdClient, assetRegistry, serverMode);
	registerGlslPatternTools(
		server,
		logger,
		tdClient,
		knowledgeRegistry,
		serverMode,
	);

	return { assetRegistry };
}
