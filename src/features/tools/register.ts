import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ILogger } from "../../core/logger.js";
import type { ServerMode } from "../../core/serverMode.js";
import type { TouchDesignerClient } from "../../tdClient/index.js";
import type { FusionService } from "../resources/fusionService.js";
import type { KnowledgeRegistry } from "../resources/registry.js";
import type { VersionManifest } from "../resources/versionManifest.js";
import {
	resolveBuiltinAssetsPath,
	resolveProjectAssetsPath,
	resolveUserAssetsPath,
} from "../templates/paths.js";
import { AssetRegistry } from "../templates/registry.js";
import type { AssetSource } from "../templates/types.js";
import { registerAssetTools } from "./handlers/assetTools.js";
import { registerExecLogTools } from "./handlers/execLogTools.js";
import { registerGlslPatternTools } from "./handlers/glslPatternTools.js";
import { registerHealthTools } from "./handlers/healthTools.js";
import { registerLessonTools } from "./handlers/lessonTools.js";
import { resolveKnowledgePath } from "../resources/paths.js";
import { registerPaletteTools } from "./handlers/paletteTools.js";
import { registerProjectCatalogTools } from "./handlers/projectCatalogTools.js";
import { registerSearchTools } from "./handlers/searchTools.js";
import { registerTdTools } from "./handlers/tdTools.js";
import { ExecAuditLog } from "./security/index.js";

export interface ResourceDeps {
	fusionService: FusionService;
	versionManifest: VersionManifest;
}

/**
 * Register tool handlers with MCP server
 */
export function registerTools(
	server: McpServer,
	logger: ILogger,
	tdClient: TouchDesignerClient,
	serverMode: ServerMode,
	knowledgeRegistry: KnowledgeRegistry,
	resourceDeps?: ResourceDeps,
): { assetRegistry: AssetRegistry } {
	const auditLog = new ExecAuditLog();
	registerTdTools(server, logger, tdClient, serverMode, auditLog);
	registerHealthTools(server, logger, tdClient, serverMode);
	registerExecLogTools(server, logger, auditLog);

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

	// Register search/compare tools if resource dependencies available
	if (resourceDeps) {
		registerSearchTools(
			server,
			logger,
			knowledgeRegistry,
			resourceDeps.versionManifest,
			resourceDeps.fusionService,
			serverMode,
		);
	}

	// Register lesson tools (offline, no TD needed)
	const knowledgePath = resolveKnowledgePath(import.meta.url);
	registerLessonTools(server, logger, knowledgeRegistry, serverMode, knowledgePath, tdClient);

	// Register project catalog tools
	registerProjectCatalogTools(server, logger, tdClient, serverMode, auditLog);

	// Register palette tools (index, search, load)
	registerPaletteTools(server, logger, tdClient, serverMode, auditLog);

	return { assetRegistry };
}
