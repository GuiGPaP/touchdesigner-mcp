/**
 * Reference URLs for TouchDesigner Python documentation
 */
export const TD_PYTHON_CLASS_REFERENCE_BASE_URL = "https://docs.derivative.ca";
export const TD_PYTHON_CLASS_REFERENCE_INDEX_URL = `${TD_PYTHON_CLASS_REFERENCE_BASE_URL}/Python_Classes_and_Modules`;

/**
 * Reference Tool Names for TouchDesigner MCP
 */
export const TOOL_NAMES = {
	COMPLETE_OP_PATHS: "complete_op_paths",
	CONFIGURE_INSTANCING: "configure_instancing",
	CREATE_FEEDBACK_LOOP: "create_feedback_loop",
	CREATE_GEOMETRY_COMP: "create_geometry_comp",
	CREATE_TD_NODE: "create_td_node",
	DELETE_TD_NODE: "delete_td_node",
	DEPLOY_TD_ASSET: "deploy_td_asset",
	DESCRIBE_TD_TOOLS: "describe_td_tools",
	DISCOVER_DAT_CANDIDATES: "discover_dat_candidates",
	EXECUTE_NODE_METHOD: "exec_node_method",
	EXECUTE_PYTHON_SCRIPT: "execute_python_script",
	FORMAT_DAT: "format_dat",
	GET_CAPABILITIES: "get_capabilities",
	GET_CHOP_CHANNELS: "get_chop_channels",
	GET_COMP_EXTENSIONS: "get_comp_extensions",
	GET_DAT_TABLE_INFO: "get_dat_table_info",
	GET_DAT_TEXT: "get_dat_text",
	GET_NODE_PARAMETER_SCHEMA: "get_node_parameter_schema",
	GET_TD_ASSET: "get_td_asset",
	GET_TD_CLASS_DETAILS: "get_td_class_details",
	GET_TD_CLASSES: "get_td_classes",
	GET_TD_CONTEXT: "get_td_context",
	GET_TD_INFO: "get_td_info",
	GET_TD_MODULE_HELP: "get_td_module_help",
	GET_TD_NODE_ERRORS: "get_td_node_errors",
	GET_TD_NODE_PARAMETERS: "get_td_node_parameters",
	GET_TD_NODES: "get_td_nodes",
	INDEX_TD_PROJECT: "index_td_project",
	LINT_DAT: "lint_dat",
	LINT_DATS: "lint_dats",
	SEARCH_TD_ASSETS: "search_td_assets",
	SET_DAT_TEXT: "set_dat_text",
	TYPECHECK_DAT: "typecheck_dat",
	UPDATE_TD_NODE_PARAMETERS: "update_td_node_parameters",
	VALIDATE_GLSL_DAT: "validate_glsl_dat",
	VALIDATE_JSON_DAT: "validate_json_dat",
} as const;

export const REFERENCE_COMMENT = `Check reference resources: ${TD_PYTHON_CLASS_REFERENCE_INDEX_URL}`;

export const RESOURCE_URIS = {
	MODULE_DETAIL: "td://modules/{id}",
	MODULES_INDEX: "td://modules",
	OPERATOR_DETAIL: "td://operators/{id}",
	OPERATORS_INDEX: "td://operators",
} as const;

export const PROMPT_NAMES = {
	CHECK_NODE_ERRORS: "Check node errors",
	NODE_CONNECTION: "Node connection",
	SEARCH_NODE: "Search node",
} as const;
