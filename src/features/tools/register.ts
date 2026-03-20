import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ILogger } from "../../core/logger.js";
import type { TouchDesignerClient } from "../../tdClient/index.js";
import {
	resolveBuiltinAssetsPath,
	resolveProjectAssetsPath,
	resolveUserAssetsPath,
} from "../templates/paths.js";
import { AssetRegistry } from "../templates/registry.js";
import type { AssetSource } from "../templates/types.js";
import { registerAssetTools } from "./handlers/assetTools.js";
import { registerTdTools } from "./handlers/tdTools.js";

/**
 * Register resource handlers with MCP server
 */
export function registerTools(
	server: McpServer,
	logger: ILogger,
	tdClient: TouchDesignerClient,
): void {
	registerTdTools(server, logger, tdClient);

	// Initialize asset registry with discovered paths
	const registry = new AssetRegistry(logger);
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

	registry.loadAll(assetPaths);

	registerAssetTools(server, logger, tdClient, registry);
}
