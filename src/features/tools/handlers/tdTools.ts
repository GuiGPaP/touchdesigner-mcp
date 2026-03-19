import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { REFERENCE_COMMENT, TOOL_NAMES } from "../../../core/constants.js";
import { handleToolError } from "../../../core/errorHandling.js";
import type { ILogger } from "../../../core/logger.js";
import {
	CompleteOpPathsQueryParams,
	ConfigureInstancingBody,
	CreateFeedbackLoopBody,
	CreateGeometryCompBody,
	CreateNodeBody,
	DeleteNodeQueryParams,
	DiscoverDatCandidatesQueryParams,
	ExecNodeMethodBody,
	ExecPythonScriptBody,
	GetChopChannelsQueryParams,
	GetCompExtensionsQueryParams,
	GetDatTableInfoQueryParams,
	GetDatTextQueryParams,
	GetModuleHelpQueryParams,
	GetNodeDetailQueryParams,
	GetNodeErrorsQueryParams,
	GetNodeParameterSchemaQueryParams,
	GetNodesQueryParams,
	GetTdPythonClassDetailsParams,
	FormatDatBody,
	LintDatBody,
	LintDatsBody,
	ValidateGlslDatBody,
	TypecheckDatBody,
	ValidateJsonDatBody,
	SetDatTextBody,
	UpdateNodeBody,
} from "../../../gen/mcp/touchDesignerAPI.zod.js";
import type { TouchDesignerClient } from "../../../tdClient/touchDesignerClient.js";
import type { ToolMetadata } from "../metadata/touchDesignerToolMetadata.js";
import { getTouchDesignerToolMetadata } from "../metadata/touchDesignerToolMetadata.js";
import {
	formatCapabilities,
	formatChopChannels,
	formatClassDetails,
	formatClassList,
	formatCompExtensions,
	formatCompleteOpPaths,
	formatConfigureInstancing,
	formatCreateFeedbackLoop,
	formatCreateGeometryComp,
	formatCreateNodeResult,
	formatDatTableInfo,
	formatDatText,
	formatDeleteNodeResult,
	formatDiscoverDatCandidates,
	formatFormatDat,
	formatValidateGlslDat,
	formatValidateJsonDat,
	formatExecNodeMethodResult,
	formatLintDat,
	formatLintDats,
	formatTypecheckDat,
	formatModuleHelp,
	formatNodeDetails,
	formatNodeErrors,
	formatNodeList,
	formatParameterSchema,
	formatScriptResult,
	formatSetDatText,
	formatTdInfo,
	formatToolMetadata,
	formatUpdateNodeResult,
} from "../presenter/index.js";
import {
	detailOnlyFormattingSchema,
	type FormattingOptionsParams,
	formattingOptionsSchema,
} from "../types.js";

const execPythonScriptToolSchema = ExecPythonScriptBody.extend(
	detailOnlyFormattingSchema.shape,
);
type ExecPythonScriptToolParams = z.input<typeof execPythonScriptToolSchema>;

const tdInfoToolSchema = detailOnlyFormattingSchema;
type TdInfoToolParams = z.input<typeof tdInfoToolSchema>;

const capabilitiesToolSchema = detailOnlyFormattingSchema;
type CapabilitiesToolParams = z.input<typeof capabilitiesToolSchema>;

const getNodesToolSchema = GetNodesQueryParams.extend(
	formattingOptionsSchema.shape,
);
type GetNodesToolParams = z.input<typeof getNodesToolSchema>;

const getNodeDetailToolSchema = GetNodeDetailQueryParams.extend(
	formattingOptionsSchema.shape,
);
type GetNodeDetailToolParams = z.input<typeof getNodeDetailToolSchema>;

const getNodeErrorsToolSchema = GetNodeErrorsQueryParams.extend(
	formattingOptionsSchema.shape,
);
type GetNodeErrorsToolParams = z.input<typeof getNodeErrorsToolSchema>;

const createNodeToolSchema = CreateNodeBody.extend(
	detailOnlyFormattingSchema.shape,
);
type CreateNodeToolParams = z.input<typeof createNodeToolSchema>;

const updateNodeToolSchema = UpdateNodeBody.extend(
	detailOnlyFormattingSchema.shape,
);
type UpdateNodeToolParams = z.input<typeof updateNodeToolSchema>;

const deleteNodeToolSchema = DeleteNodeQueryParams.extend(
	detailOnlyFormattingSchema.shape,
);
type DeleteNodeToolParams = z.input<typeof deleteNodeToolSchema>;

const classListToolSchema = formattingOptionsSchema;
type ClassListToolParams = FormattingOptionsParams;

const classDetailToolSchema = GetTdPythonClassDetailsParams.extend(
	formattingOptionsSchema.shape,
);
type ClassDetailToolParams = z.input<typeof classDetailToolSchema>;

const moduleHelpToolSchema = GetModuleHelpQueryParams.extend(
	detailOnlyFormattingSchema.shape,
);
type ModuleHelpToolParams = z.input<typeof moduleHelpToolSchema>;

const execNodeMethodToolSchema = ExecNodeMethodBody.extend(
	detailOnlyFormattingSchema.shape,
);
type ExecNodeMethodToolParams = z.input<typeof execNodeMethodToolSchema>;

const getDatTextToolSchema = GetDatTextQueryParams.extend(
	detailOnlyFormattingSchema.shape,
);
type GetDatTextToolParams = z.input<typeof getDatTextToolSchema>;

const setDatTextToolSchema = SetDatTextBody.extend(
	detailOnlyFormattingSchema.shape,
);
type SetDatTextToolParams = z.input<typeof setDatTextToolSchema>;

const lintDatToolSchema = LintDatBody.extend(detailOnlyFormattingSchema.shape);
type LintDatToolParams = z.input<typeof lintDatToolSchema>;

const typecheckDatToolSchema = TypecheckDatBody.extend(detailOnlyFormattingSchema.shape);
type TypecheckDatToolParams = z.input<typeof typecheckDatToolSchema>;

const lintDatsToolSchema = LintDatsBody.extend(
	detailOnlyFormattingSchema.shape,
);
type LintDatsToolParams = z.input<typeof lintDatsToolSchema>;

const formatDatToolSchema = FormatDatBody.extend(
	detailOnlyFormattingSchema.shape,
);
type FormatDatToolParams = z.input<typeof formatDatToolSchema>;

const validateGlslDatToolSchema = ValidateGlslDatBody.extend(
	detailOnlyFormattingSchema.shape,
);
type ValidateGlslDatToolParams = z.input<typeof validateGlslDatToolSchema>;

const validateJsonDatToolSchema = ValidateJsonDatBody.extend(
	detailOnlyFormattingSchema.shape,
);
type ValidateJsonDatToolParams = z.input<typeof validateJsonDatToolSchema>;

const discoverDatCandidatesToolSchema = DiscoverDatCandidatesQueryParams.extend(
	detailOnlyFormattingSchema.shape,
);
type DiscoverDatCandidatesToolParams = z.input<
	typeof discoverDatCandidatesToolSchema
>;

const createGeometryCompToolSchema = CreateGeometryCompBody.extend(
	detailOnlyFormattingSchema.shape,
);
type CreateGeometryCompToolParams = z.input<
	typeof createGeometryCompToolSchema
>;

const createFeedbackLoopToolSchema = CreateFeedbackLoopBody.extend(
	detailOnlyFormattingSchema.shape,
);
type CreateFeedbackLoopToolParams = z.input<
	typeof createFeedbackLoopToolSchema
>;

const configureInstancingToolSchema = ConfigureInstancingBody.extend(
	detailOnlyFormattingSchema.shape,
);
type ConfigureInstancingToolParams = z.input<
	typeof configureInstancingToolSchema
>;

const getNodeParameterSchemaToolSchema =
	GetNodeParameterSchemaQueryParams.extend(detailOnlyFormattingSchema.shape);
type GetNodeParameterSchemaToolParams = z.input<
	typeof getNodeParameterSchemaToolSchema
>;

const completeOpPathsToolSchema = CompleteOpPathsQueryParams.extend(
	detailOnlyFormattingSchema.shape,
);
type CompleteOpPathsToolParams = z.input<typeof completeOpPathsToolSchema>;

const getChopChannelsToolSchema = GetChopChannelsQueryParams.extend(
	detailOnlyFormattingSchema.shape,
);
type GetChopChannelsToolParams = z.input<typeof getChopChannelsToolSchema>;

const getDatTableInfoToolSchema = GetDatTableInfoQueryParams.extend(
	detailOnlyFormattingSchema.shape,
);
type GetDatTableInfoToolParams = z.input<typeof getDatTableInfoToolSchema>;

const getCompExtensionsToolSchema = GetCompExtensionsQueryParams.extend(
	detailOnlyFormattingSchema.shape,
);
type GetCompExtensionsToolParams = z.input<typeof getCompExtensionsToolSchema>;

const describeToolsSchema = detailOnlyFormattingSchema.extend({
	filter: z
		.string()
		.min(1)
		.describe(
			"Optional keyword to filter by tool name, module path, or parameter description",
		)
		.optional(),
});
type DescribeToolsParams = z.input<typeof describeToolsSchema>;

export function registerTdTools(
	server: McpServer,
	logger: ILogger,
	tdClient: TouchDesignerClient,
): void {
	const toolMetadataEntries = getTouchDesignerToolMetadata();

	server.tool(
		TOOL_NAMES.DESCRIBE_TD_TOOLS,
		"Generate a filesystem-oriented manifest of available TouchDesigner tools",
		describeToolsSchema.strict().shape,
		async (params: DescribeToolsParams = {}) => {
			try {
				const { detailLevel, responseFormat, filter } = params;
				const normalizedFilter = filter?.trim().toLowerCase();
				const filteredEntries = normalizedFilter
					? toolMetadataEntries.filter((entry) =>
							matchesMetadataFilter(entry, normalizedFilter),
						)
					: toolMetadataEntries;

				if (filteredEntries.length === 0) {
					const message = filter
						? `No TouchDesigner tools matched filter "${filter}".`
						: "No TouchDesigner tools are registered.";
					return {
						content: [
							{
								text: message,
								type: "text" as const,
							},
						],
					};
				}

				const formattedText = formatToolMetadata(filteredEntries, {
					detailLevel: detailLevel ?? (filter ? "summary" : "minimal"),
					filter: normalizedFilter,
					responseFormat,
				});

				return {
					content: [
						{
							text: formattedText,
							type: "text" as const,
						},
					],
				};
			} catch (error) {
				return handleToolError(error, logger, TOOL_NAMES.DESCRIBE_TD_TOOLS);
			}
		},
	);

	server.tool(
		TOOL_NAMES.GET_TD_INFO,
		"Get server information from TouchDesigner",
		tdInfoToolSchema.strict().shape,
		async (params: TdInfoToolParams = {}) => {
			try {
				const { detailLevel, responseFormat } = params;
				const result = await tdClient.getTdInfo();
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatTdInfo(result.data, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(error, logger, TOOL_NAMES.GET_TD_INFO);
			}
		},
	);

	server.tool(
		TOOL_NAMES.GET_CAPABILITIES,
		"Get available capabilities and tool versions from the TouchDesigner server",
		capabilitiesToolSchema.strict().shape,
		async (params: CapabilitiesToolParams = {}) => {
			try {
				const { detailLevel, responseFormat } = params;
				const result = await tdClient.getCapabilities();
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatCapabilities(result.data, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(
					error,
					logger,
					TOOL_NAMES.GET_CAPABILITIES,
				);
			}
		},
	);

	server.tool(
		TOOL_NAMES.EXECUTE_PYTHON_SCRIPT,
		"Execute a Python script in TouchDesigner (detailLevel=minimal|summary|detailed, responseFormat=json|yaml|markdown)",
		execPythonScriptToolSchema.strict().shape,
		async (params: ExecPythonScriptToolParams) => {
			try {
				const { detailLevel, responseFormat, ...scriptParams } = params;
				logger.sendLog({
					data: `Executing script: ${scriptParams.script}`,
					level: "debug",
				});

				const result = await tdClient.execPythonScript(scriptParams);
				if (!result.success) {
					throw result.error;
				}

				// Use formatter for token-optimized response
				const formattedText = formatScriptResult(result, scriptParams.script, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});

				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(error, logger, TOOL_NAMES.EXECUTE_PYTHON_SCRIPT);
			}
		},
	);
	server.tool(
		TOOL_NAMES.CREATE_TD_NODE,
		"Create a new node in TouchDesigner",
		createNodeToolSchema.strict().shape,
		async (params: CreateNodeToolParams) => {
			try {
				const { detailLevel, responseFormat, ...createParams } = params;

				const result = await tdClient.createNode(createParams);
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatCreateNodeResult(result.data, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(
					error,
					logger,
					TOOL_NAMES.CREATE_TD_NODE,
					REFERENCE_COMMENT,
				);
			}
		},
	);

	server.tool(
		TOOL_NAMES.DELETE_TD_NODE,
		"Delete an existing node in TouchDesigner",
		deleteNodeToolSchema.strict().shape,
		async (params: DeleteNodeToolParams) => {
			try {
				const { detailLevel, responseFormat, ...deleteParams } = params;
				const result = await tdClient.deleteNode(deleteParams);
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatDeleteNodeResult(result.data, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(
					error,
					logger,
					TOOL_NAMES.DELETE_TD_NODE,
					REFERENCE_COMMENT,
				);
			}
		},
	);

	server.tool(
		TOOL_NAMES.GET_TD_NODES,
		"List nodes under a path with token-optimized output (detailLevel+limit supported)",
		getNodesToolSchema.strict().shape,
		async (params: GetNodesToolParams) => {
			try {
				const { detailLevel, limit, responseFormat, ...queryParams } = params;
				const result = await tdClient.getNodes(queryParams);
				if (!result.success) {
					throw result.error;
				}

				// Use formatter for token-optimized response
				const fallbackMode = queryParams.includeProperties
					? "detailed"
					: "summary";
				const formattedText = formatNodeList(result.data, {
					detailLevel: detailLevel ?? fallbackMode,
					limit,
					responseFormat,
				});

				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(
					error,
					logger,
					TOOL_NAMES.GET_TD_NODES,
					REFERENCE_COMMENT,
				);
			}
		},
	);

	server.tool(
		TOOL_NAMES.GET_TD_NODE_PARAMETERS,
		"Get node parameters with concise/detailed formatting (detailLevel+limit supported)",
		getNodeDetailToolSchema.strict().shape,
		async (params: GetNodeDetailToolParams) => {
			try {
				const { detailLevel, limit, responseFormat, ...queryParams } = params;
				const result = await tdClient.getNodeDetail(queryParams);
				if (!result.success) {
					throw result.error;
				}

				// Use formatter for token-optimized response
				const formattedText = formatNodeDetails(result.data, {
					detailLevel: detailLevel ?? "summary",
					limit,
					responseFormat,
				});

				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(
					error,
					logger,

					TOOL_NAMES.GET_TD_NODE_PARAMETERS,
					REFERENCE_COMMENT,
				);
			}
		},
	);

	server.tool(
		TOOL_NAMES.GET_TD_NODE_ERRORS,
		"Check node and descendant errors reported by TouchDesigner",
		getNodeErrorsToolSchema.strict().shape,
		async (params: GetNodeErrorsToolParams) => {
			try {
				const { detailLevel, limit, responseFormat, ...queryParams } = params;
				const result = await tdClient.getNodeErrors(queryParams);
				if (!result.success) {
					throw result.error;
				}

				const formattedText = formatNodeErrors(result.data, {
					detailLevel: detailLevel ?? "summary",
					limit,
					responseFormat,
				});

				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(
					error,
					logger,
					TOOL_NAMES.GET_TD_NODE_ERRORS,
					REFERENCE_COMMENT,
				);
			}
		},
	);

	server.tool(
		TOOL_NAMES.UPDATE_TD_NODE_PARAMETERS,
		"Update parameters of a specific node in TouchDesigner",
		updateNodeToolSchema.strict().shape,
		async (params: UpdateNodeToolParams) => {
			try {
				const { detailLevel, responseFormat, ...updateParams } = params;
				const result = await tdClient.updateNode(updateParams);
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatUpdateNodeResult(result.data, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(
					error,
					logger,
					TOOL_NAMES.UPDATE_TD_NODE_PARAMETERS,
					REFERENCE_COMMENT,
				);
			}
		},
	);

	server.tool(
		TOOL_NAMES.EXECUTE_NODE_METHOD,
		"Execute a method on a specific node in TouchDesigner",
		execNodeMethodToolSchema.strict().shape,
		async (params: ExecNodeMethodToolParams) => {
			try {
				const { detailLevel, responseFormat, ...execParams } = params;
				const { nodePath, method, args, kwargs } = execParams;

				const result = await tdClient.execNodeMethod(execParams);
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatExecNodeMethodResult(
					result.data,
					{ args, kwargs, method, nodePath },
					{ detailLevel: detailLevel ?? "summary", responseFormat },
				);
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				logger.sendLog({
					data: error,
					level: "error",
				});
				return handleToolError(
					error,
					logger,
					TOOL_NAMES.EXECUTE_NODE_METHOD,
					REFERENCE_COMMENT,
				);
			}
		},
	);

	server.tool(
		TOOL_NAMES.GET_TD_CLASSES,
		"List TouchDesigner Python classes/modules (detailLevel+limit supported)",
		classListToolSchema.strict().shape,
		async (params: ClassListToolParams = {}) => {
			try {
				const result = await tdClient.getClasses();
				if (!result.success) {
					throw result.error;
				}

				// Use formatter for token-optimized response
				const formattedText = formatClassList(result.data, {
					detailLevel: params.detailLevel ?? "summary",
					limit: params.limit ?? 50,
					responseFormat: params.responseFormat,
				});

				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(
					error,
					logger,
					TOOL_NAMES.GET_TD_CLASSES,
					REFERENCE_COMMENT,
				);
			}
		},
	);

	server.tool(
		TOOL_NAMES.GET_TD_CLASS_DETAILS,
		"Get information about a TouchDesigner class/module (detailLevel+limit supported)",
		classDetailToolSchema.strict().shape,
		async (params: ClassDetailToolParams) => {
			try {
				const { className, detailLevel, limit, responseFormat } = params;
				const result = await tdClient.getClassDetails(className);
				if (!result.success) {
					throw result.error;
				}

				// Use formatter for token-optimized response
				const formattedText = formatClassDetails(result.data, {
					detailLevel: detailLevel ?? "summary",
					limit: limit ?? 30,
					responseFormat,
				});

				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(
					error,
					logger,
					TOOL_NAMES.GET_TD_CLASS_DETAILS,
					REFERENCE_COMMENT,
				);
			}
		},
	);

	server.tool(
		TOOL_NAMES.GET_TD_MODULE_HELP,
		"Retrieve Python help() text for a TouchDesigner module or class",
		moduleHelpToolSchema.strict().shape,
		async (params: ModuleHelpToolParams) => {
			try {
				const { detailLevel, moduleName, responseFormat } = params;
				const result = await tdClient.getModuleHelp({ moduleName });
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatModuleHelp(result.data, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(error, logger, TOOL_NAMES.GET_TD_MODULE_HELP);
			}
		},
	);

	server.tool(
		TOOL_NAMES.GET_DAT_TEXT,
		"Read the .text content of a DAT operator in TouchDesigner",
		getDatTextToolSchema.strict().shape,
		async (params: GetDatTextToolParams) => {
			try {
				const { detailLevel, responseFormat, ...queryParams } = params;
				const result = await tdClient.getDatText(queryParams);
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatDatText(result.data, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(error, logger, TOOL_NAMES.GET_DAT_TEXT);
			}
		},
	);

	server.tool(
		TOOL_NAMES.SET_DAT_TEXT,
		"Write .text content to a DAT operator in TouchDesigner",
		setDatTextToolSchema.strict().shape,
		async (params: SetDatTextToolParams) => {
			try {
				const { detailLevel, responseFormat, ...bodyParams } = params;
				const result = await tdClient.setDatText(bodyParams);
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatSetDatText(result.data, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(error, logger, TOOL_NAMES.SET_DAT_TEXT);
			}
		},
	);

	server.tool(
		TOOL_NAMES.LINT_DAT,
		"Lint DAT code with ruff and optionally auto-fix issues",
		lintDatToolSchema.strict().shape,
		async (params: LintDatToolParams) => {
			try {
				const { detailLevel, responseFormat, ...bodyParams } = params;
				const result = await tdClient.lintDat(bodyParams);
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatLintDat(result.data, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(error, logger, TOOL_NAMES.LINT_DAT);
			}
		},
	);

	server.tool(
		TOOL_NAMES.TYPECHECK_DAT,
		"Typecheck DAT code with pyright using td.pyi stubs",
		typecheckDatToolSchema.strict().shape,
		async (params: TypecheckDatToolParams) => {
			try {
				const { detailLevel, responseFormat, ...bodyParams } = params;
				const result = await tdClient.typecheckDat(bodyParams);
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatTypecheckDat(result.data, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(error, logger, TOOL_NAMES.TYPECHECK_DAT);
			}
		},
	);

	server.tool(
		TOOL_NAMES.LINT_DATS,
		"Batch lint all Python DATs under a parent path with aggregated report",
		lintDatsToolSchema.strict().shape,
		async (params: LintDatsToolParams) => {
			try {
				const { detailLevel, responseFormat, ...bodyParams } = params;
				const result = await tdClient.lintDats(bodyParams);
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatLintDats(result.data, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(error, logger, TOOL_NAMES.LINT_DATS);
			}
		},
	);

	server.tool(
		TOOL_NAMES.FORMAT_DAT,
		"Format DAT code with ruff format, with optional dry-run preview",
		formatDatToolSchema.strict().shape,
		async (params: FormatDatToolParams) => {
			try {
				const { detailLevel, responseFormat, ...bodyParams } = params;
				const result = await tdClient.formatDat(bodyParams);
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatFormatDat(result.data, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(error, logger, TOOL_NAMES.FORMAT_DAT);
			}
		},
	);

	server.tool(
		TOOL_NAMES.VALIDATE_JSON_DAT,
		"Validate JSON or YAML content in a DAT operator with structured diagnostics",
		validateJsonDatToolSchema.strict().shape,
		async (params: ValidateJsonDatToolParams) => {
			try {
				const { detailLevel, responseFormat, ...bodyParams } = params;
				const result = await tdClient.validateJsonDat(bodyParams);
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatValidateJsonDat(result.data, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(
					error,
					logger,
					TOOL_NAMES.VALIDATE_JSON_DAT,
				);
			}
		},
	);

	server.tool(
		TOOL_NAMES.VALIDATE_GLSL_DAT,
		"Validate GLSL shader code in a DAT operator with structured diagnostics",
		validateGlslDatToolSchema.strict().shape,
		async (params: ValidateGlslDatToolParams) => {
			try {
				const { detailLevel, responseFormat, ...bodyParams } = params;
				const result = await tdClient.validateGlslDat(bodyParams);
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatValidateGlslDat(result.data, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(
					error,
					logger,
					TOOL_NAMES.VALIDATE_GLSL_DAT,
				);
			}
		},
	);

	server.tool(
		TOOL_NAMES.DISCOVER_DAT_CANDIDATES,
		"Discover DAT candidates under a parent, classified by kind (python, glsl, text, data)",
		discoverDatCandidatesToolSchema.strict().shape,
		async (params: DiscoverDatCandidatesToolParams) => {
			try {
				const { detailLevel, responseFormat, ...queryParams } = params;
				const result = await tdClient.discoverDatCandidates(queryParams);
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatDiscoverDatCandidates(result.data, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(
					error,
					logger,
					TOOL_NAMES.DISCOVER_DAT_CANDIDATES,
				);
			}
		},
	);

	server.tool(
		TOOL_NAMES.CREATE_GEOMETRY_COMP,
		"Create a Geometry COMP with In/Out operators inside it",
		createGeometryCompToolSchema.strict().shape,
		async (params: CreateGeometryCompToolParams) => {
			try {
				const { detailLevel, responseFormat, ...bodyParams } = params;
				const result = await tdClient.createGeometryComp(bodyParams);
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatCreateGeometryComp(result.data, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(
					error,
					logger,
					TOOL_NAMES.CREATE_GEOMETRY_COMP,
					REFERENCE_COMMENT,
				);
			}
		},
	);

	server.tool(
		TOOL_NAMES.CREATE_FEEDBACK_LOOP,
		"Create a Feedback TOP loop with cache, process, and feedback operators",
		createFeedbackLoopToolSchema.strict().shape,
		async (params: CreateFeedbackLoopToolParams) => {
			try {
				const { detailLevel, responseFormat, ...bodyParams } = params;
				const result = await tdClient.createFeedbackLoop(bodyParams);
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatCreateFeedbackLoop(result.data, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(
					error,
					logger,
					TOOL_NAMES.CREATE_FEEDBACK_LOOP,
					REFERENCE_COMMENT,
				);
			}
		},
	);

	server.tool(
		TOOL_NAMES.CONFIGURE_INSTANCING,
		"Configure GPU instancing on an existing Geometry COMP",
		configureInstancingToolSchema.strict().shape,
		async (params: ConfigureInstancingToolParams) => {
			try {
				const { detailLevel, responseFormat, ...bodyParams } = params;
				const result = await tdClient.configureInstancing(bodyParams);
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatConfigureInstancing(result.data, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(
					error,
					logger,
					TOOL_NAMES.CONFIGURE_INSTANCING,
					REFERENCE_COMMENT,
				);
			}
		},
	);

	server.tool(
		TOOL_NAMES.GET_NODE_PARAMETER_SCHEMA,
		"Get parameter schema metadata (type, range, menu, default) for a node",
		getNodeParameterSchemaToolSchema.strict().shape,
		async (params: GetNodeParameterSchemaToolParams) => {
			try {
				const { detailLevel, responseFormat, ...queryParams } = params;
				const result = await tdClient.getNodeParameterSchema(queryParams);
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatParameterSchema(result.data, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(
					error,
					logger,
					TOOL_NAMES.GET_NODE_PARAMETER_SCHEMA,
				);
			}
		},
	);

	server.tool(
		TOOL_NAMES.COMPLETE_OP_PATHS,
		"Complete op() path references from a context node",
		completeOpPathsToolSchema.strict().shape,
		async (params: CompleteOpPathsToolParams) => {
			try {
				const { detailLevel, responseFormat, ...queryParams } = params;
				const result = await tdClient.completeOpPaths(queryParams);
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatCompleteOpPaths(result.data, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(
					error,
					logger,
					TOOL_NAMES.COMPLETE_OP_PATHS,
				);
			}
		},
	);

	server.tool(
		TOOL_NAMES.GET_CHOP_CHANNELS,
		"Get channel information for a CHOP node",
		getChopChannelsToolSchema.strict().shape,
		async (params: GetChopChannelsToolParams) => {
			try {
				const { detailLevel, responseFormat, ...queryParams } = params;
				const result = await tdClient.getChopChannels(queryParams);
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatChopChannels(result.data, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(
					error,
					logger,
					TOOL_NAMES.GET_CHOP_CHANNELS,
				);
			}
		},
	);

	server.tool(
		TOOL_NAMES.GET_DAT_TABLE_INFO,
		"Get table DAT dimensions and sample data",
		getDatTableInfoToolSchema.strict().shape,
		async (params: GetDatTableInfoToolParams) => {
			try {
				const { detailLevel, responseFormat, ...queryParams } = params;
				const result = await tdClient.getDatTableInfo(queryParams);
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatDatTableInfo(result.data, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(
					error,
					logger,
					TOOL_NAMES.GET_DAT_TABLE_INFO,
				);
			}
		},
	);

	server.tool(
		TOOL_NAMES.GET_COMP_EXTENSIONS,
		"Get COMP extension methods and properties",
		getCompExtensionsToolSchema.strict().shape,
		async (params: GetCompExtensionsToolParams) => {
			try {
				const { detailLevel, responseFormat, ...queryParams } = params;
				const result = await tdClient.getCompExtensions(queryParams);
				if (!result.success) {
					throw result.error;
				}
				const formattedText = formatCompExtensions(result.data, {
					detailLevel: detailLevel ?? "summary",
					responseFormat,
				});
				return createToolResult(tdClient, formattedText);
			} catch (error) {
				return handleToolError(
					error,
					logger,
					TOOL_NAMES.GET_COMP_EXTENSIONS,
				);
			}
		},
	);
}

const createToolResult = (
	tdClient: TouchDesignerClient,
	text: string,
): z.infer<typeof CallToolResultSchema> => {
	const content: z.infer<typeof CallToolResultSchema>["content"] = [
		{
			text,
			type: "text" as const,
		},
	];
	const additionalContents = tdClient.getAdditionalToolResultContents();
	if (additionalContents) {
		content.push(...additionalContents);
	}
	return { content };
};

function matchesMetadataFilter(entry: ToolMetadata, keyword: string): boolean {
	const normalizedKeyword = keyword.toLowerCase();
	const haystacks = [
		entry.functionName,
		entry.modulePath,
		entry.description,
		entry.category,
		entry.tool,
		entry.notes ?? "",
	];

	if (
		haystacks.some((value) => value.toLowerCase().includes(normalizedKeyword))
	) {
		return true;
	}

	return entry.parameters.some((param) =>
		[param.name, param.type, param.description ?? ""].some((value) =>
			value.toLowerCase().includes(normalizedKeyword),
		),
	);
}
