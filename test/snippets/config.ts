/**
 * Configuration system for snippet testing framework
 * Supports file-based config with discovery and merging
 */

/**
 * Configuration interface for snippet testing (file-based)
 */
export interface SnippetTestFileConfig {
  /**
   * Files to test (glob patterns)
   * @example ["**\/*.md", "!node_modules/**"]
   */
  files?: string[]

  /**
   * Languages to extract from code blocks
   * @default ["js", "javascript", "ts", "typescript"]
   */
  languages?: string[]

  /**
   * Whether to include code blocks without directives
   * @default true
   */
  includeUndirected?: boolean

  /**
   * Show success messages for passing tests
   * @default false
   */
  showSuccess?: boolean

  /**
   * Show skip messages for skipped tests
   * @default false
   */
  showSkipped?: boolean

  /**
   * Verbose output (includes stack traces)
   * @default false
   */
  verbose?: boolean

  /**
   * Default timeout for test execution (milliseconds)
   * @default 5000
   */
  timeout?: number

  /**
   * Plugins to load (as module paths to import)
   * @example ["./my-plugin.js", "@scope/snippet-plugin"]
   */
  plugins?: string[]

  /**
   * Global variables to inject into execution context
   * Note: These should be serializable or will need custom handling
   */
  globals?: Record<string, unknown>

  /**
   * Module resolver function name to use
   * Must be defined in the test environment
   */
  moduleResolver?: string

  /**
   * Custom directives to register
   * Path to module that exports directives
   */
  customDirectives?: string[]
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: Required<Omit<SnippetTestFileConfig, "plugins" | "customDirectives" | "moduleResolver" | "globals">> = {
  files: ["**/*.md"],
  languages: ["js", "javascript", "ts", "typescript"],
  includeUndirected: true,
  showSuccess: false,
  showSkipped: false,
  verbose: false,
  timeout: 5000,
}

/**
 * Config file names to search for (in priority order)
 */
export const CONFIG_FILE_NAMES = [
  ".snippet-testrc.json",
  ".snippet-testrc.js",
  "snippet-test.config.json",
  "snippet-test.config.js",
] as const

/**
 * Merge multiple configs, with later configs taking precedence
 */
export function mergeConfigs(...configs: Partial<SnippetTestFileConfig>[]): SnippetTestFileConfig {
  const merged: SnippetTestFileConfig = {}

  for (const config of configs) {
    if (config.files !== undefined) {
      merged.files = config.files
    }
    if (config.languages !== undefined) {
      merged.languages = config.languages
    }
    if (config.includeUndirected !== undefined) {
      merged.includeUndirected = config.includeUndirected
    }
    if (config.showSuccess !== undefined) {
      merged.showSuccess = config.showSuccess
    }
    if (config.showSkipped !== undefined) {
      merged.showSkipped = config.showSkipped
    }
    if (config.verbose !== undefined) {
      merged.verbose = config.verbose
    }
    if (config.timeout !== undefined) {
      merged.timeout = config.timeout
    }
    if (config.plugins !== undefined) {
      // Merge arrays
      merged.plugins = [...(merged.plugins || []), ...config.plugins]
    }
    if (config.globals !== undefined) {
      // Merge objects
      merged.globals = { ...merged.globals, ...config.globals }
    }
    if (config.moduleResolver !== undefined) {
      merged.moduleResolver = config.moduleResolver
    }
    if (config.customDirectives !== undefined) {
      // Merge arrays
      merged.customDirectives = [...(merged.customDirectives || []), ...config.customDirectives]
    }
  }

  return merged
}

/**
 * Apply defaults to a config
 */
export function applyDefaults(config: Partial<SnippetTestFileConfig>): SnippetTestFileConfig {
  return {
    files: config.files ?? DEFAULT_CONFIG.files,
    languages: config.languages ?? DEFAULT_CONFIG.languages,
    includeUndirected: config.includeUndirected ?? DEFAULT_CONFIG.includeUndirected,
    showSuccess: config.showSuccess ?? DEFAULT_CONFIG.showSuccess,
    showSkipped: config.showSkipped ?? DEFAULT_CONFIG.showSkipped,
    verbose: config.verbose ?? DEFAULT_CONFIG.verbose,
    timeout: config.timeout ?? DEFAULT_CONFIG.timeout,
    plugins: config.plugins,
    globals: config.globals,
    moduleResolver: config.moduleResolver,
    customDirectives: config.customDirectives,
  }
}

/**
 * Validate a config object
 */
export function validateConfig(config: unknown): config is SnippetTestFileConfig {
  if (typeof config !== "object" || config === null) {
    return false
  }

  const c = config as Record<string, unknown>

  // Validate files
  if (c.files !== undefined) {
    if (!Array.isArray(c.files) || !c.files.every(f => typeof f === "string")) {
      throw new Error("Config 'files' must be an array of strings")
    }
  }

  // Validate languages
  if (c.languages !== undefined) {
    if (!Array.isArray(c.languages) || !c.languages.every(l => typeof l === "string")) {
      throw new Error("Config 'languages' must be an array of strings")
    }
  }

  // Validate boolean fields
  const boolFields = ["includeUndirected", "showSuccess", "showSkipped", "verbose"]
  for (const field of boolFields) {
    if (c[field] !== undefined && typeof c[field] !== "boolean") {
      throw new Error(`Config '${field}' must be a boolean`)
    }
  }

  // Validate timeout
  if (c.timeout !== undefined) {
    if (typeof c.timeout !== "number" || c.timeout <= 0) {
      throw new Error("Config 'timeout' must be a positive number")
    }
  }

  // Validate plugins
  if (c.plugins !== undefined) {
    if (!Array.isArray(c.plugins) || !c.plugins.every(p => typeof p === "string")) {
      throw new Error("Config 'plugins' must be an array of strings")
    }
  }

  // Validate globals
  if (c.globals !== undefined) {
    if (typeof c.globals !== "object" || c.globals === null) {
      throw new Error("Config 'globals' must be an object")
    }
  }

  // Validate moduleResolver
  if (c.moduleResolver !== undefined && typeof c.moduleResolver !== "string") {
    throw new Error("Config 'moduleResolver' must be a string")
  }

  // Validate customDirectives
  if (c.customDirectives !== undefined) {
    if (!Array.isArray(c.customDirectives) || !c.customDirectives.every(d => typeof d === "string")) {
      throw new Error("Config 'customDirectives' must be an array of strings")
    }
  }

  return true
}

/**
 * Load and parse a JSON config file
 */
export async function loadJsonConfig(filePath: string, readFile: (path: string) => Promise<string>): Promise<SnippetTestFileConfig> {
  try {
    const content = await readFile(filePath)
    const parsed = JSON.parse(content)

    if (!validateConfig(parsed)) {
      throw new Error(`Invalid config file: ${filePath}`)
    }

    return parsed
  } catch (error) {
    const err = error as Error
    if (err.name === "SyntaxError") {
      throw new Error(`Invalid JSON in config file ${filePath}: ${err.message}`)
    }
    throw error
  }
}

/**
 * Load a JavaScript config file (ES module)
 */
export async function loadJsConfig(filePath: string): Promise<SnippetTestFileConfig> {
  const module = await import(filePath)
  const config = module.default || module

  if (!validateConfig(config)) {
    throw new Error(`Invalid config file: ${filePath}`)
  }

  return config
}

/**
 * Discover config file in a directory
 * Returns the path to the first found config file, or undefined
 */
export async function discoverConfigFile(
  directory: string,
  fileExists: (path: string) => Promise<boolean>
): Promise<string | undefined> {
  for (const fileName of CONFIG_FILE_NAMES) {
    const filePath = `${directory}/${fileName}`
    if (await fileExists(filePath)) {
      return filePath
    }
  }
  return undefined
}

/**
 * Load config from a discovered or specified file
 */
export async function loadConfig(
  configPath: string | undefined,
  readFile: (path: string) => Promise<string>,
  fileExists: (path: string) => Promise<boolean>,
  currentDir: string = process.cwd()
): Promise<SnippetTestFileConfig> {
  let filePath: string | undefined = configPath

  // If no path specified, try to discover
  if (!filePath) {
    filePath = await discoverConfigFile(currentDir, fileExists)
  }

  // If still no config found, return defaults
  if (!filePath) {
    return applyDefaults({})
  }

  // Load based on file type
  if (filePath.endsWith(".json")) {
    const config = await loadJsonConfig(filePath, readFile)
    return applyDefaults(config)
  } else if (filePath.endsWith(".js")) {
    const config = await loadJsConfig(filePath)
    return applyDefaults(config)
  } else {
    throw new Error(`Unsupported config file type: ${filePath}`)
  }
}
