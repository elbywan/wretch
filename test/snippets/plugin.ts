/**
 * Plugin system for extending the snippet testing framework
 * Allows custom directives, transformers, and lifecycle hooks
 */

import type {
  CodeSnippet,
  ExecutionContext,
  ExecutionResult,
  SnippetTestResult,
} from "./types.js"
import type { AnyDirective } from "./directives/types.js"

/**
 * Plugin lifecycle hooks
 */
export interface PluginHooks {
  /**
   * Called before any snippets are processed
   * Use this to initialize resources, validate config, etc.
   */
  onInit?(): void | Promise<void>

  /**
   * Called before extracting snippets from a file
   * Can be used to skip files, modify file content, etc.
   * @returns false to skip file, modified content string, or undefined to continue
   */
  onBeforeExtract?(filePath: string, content: string): false | string | void | Promise<false | string | void>

  /**
   * Called after snippets are extracted from a file
   * Can be used to filter, modify, or add snippets
   */
  onAfterExtract?(filePath: string, snippets: CodeSnippet[]): CodeSnippet[] | void | Promise<CodeSnippet[] | void>

  /**
   * Called before running a snippet
   * Can be used to skip, modify context, etc.
   * @returns false to skip snippet, modified context, or undefined to continue
   */
  onBeforeRun?(snippet: CodeSnippet, context: ExecutionContext): false | ExecutionContext | void | Promise<false | ExecutionContext | void>

  /**
   * Called after running a snippet (before assertions)
   * Can be used to modify execution results, log data, etc.
   */
  onAfterRun?(snippet: CodeSnippet, result: ExecutionResult): ExecutionResult | void | Promise<ExecutionResult | void>

  /**
   * Called after assertions are complete
   * Can be used to modify test results, log failures, etc.
   */
  onTestComplete?(result: SnippetTestResult): SnippetTestResult | void | Promise<SnippetTestResult | void>

  /**
   * Called after all tests are complete
   * Use this to cleanup resources, generate reports, etc.
   */
  onComplete?(results: SnippetTestResult[]): void | Promise<void>

  /**
   * Called when an error occurs during testing
   * Can be used for custom error handling, logging, etc.
   */
  onError?(error: Error, snippet?: CodeSnippet): void | Promise<void>
}

/**
 * Plugin definition
 */
export interface Plugin {
  /** Plugin name (unique identifier) */
  name: string

  /** Plugin version */
  version?: string

  /** Plugin description */
  description?: string

  /** Custom directives provided by this plugin */
  directives?: AnyDirective[]

  /** Lifecycle hooks */
  hooks?: PluginHooks

  /**
   * Called when plugin is loaded
   * Use this for one-time setup
   */
  onLoad?(): void | Promise<void>

  /**
   * Called when plugin is unloaded
   * Use this for cleanup
   */
  onUnload?(): void | Promise<void>
}

/**
 * Plugin manager for loading and coordinating plugins
 */
export class PluginManager {
  private plugins: Map<string, Plugin> = new Map()
  private directives: Map<string, AnyDirective> = new Map()

  /**
   * Register a plugin
   */
  async register(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`)
    }

    // Register plugin
    this.plugins.set(plugin.name, plugin)

    // Register directives
    if (plugin.directives) {
      for (const directive of plugin.directives) {
        if (this.directives.has(directive.name)) {
          throw new Error(
            `Directive "${directive.name}" from plugin "${plugin.name}" conflicts with existing directive`
          )
        }
        this.directives.set(directive.name, directive)
      }
    }

    // Call onLoad hook
    if (plugin.onLoad) {
      await plugin.onLoad()
    }
  }

  /**
   * Unregister a plugin
   */
  async unregister(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      return
    }

    // Call onUnload hook
    if (plugin.onUnload) {
      await plugin.onUnload()
    }

    // Remove directives
    if (plugin.directives) {
      for (const directive of plugin.directives) {
        this.directives.delete(directive.name)
      }
    }

    // Remove plugin
    this.plugins.delete(pluginName)
  }

  /**
   * Get a directive by name (including plugin directives)
   */
  getDirective(name: string): AnyDirective | undefined {
    return this.directives.get(name)
  }

  /**
   * Get all registered directives
   */
  getAllDirectives(): AnyDirective[] {
    return Array.from(this.directives.values())
  }

  /**
   * Check if a plugin is registered
   */
  has(pluginName: string): boolean {
    return this.plugins.has(pluginName)
  }

  /**
   * Get a plugin by name
   */
  get(pluginName: string): Plugin | undefined {
    return this.plugins.get(pluginName)
  }

  /**
   * Get all registered plugins
   */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Call a lifecycle hook on all plugins
   */
  async callHook<K extends keyof PluginHooks>(
    hookName: K,
    ...args: Parameters<NonNullable<PluginHooks[K]>>
  ): Promise<any[]> {
    const results: any[] = []

    for (const plugin of this.plugins.values()) {
      const hook = plugin.hooks?.[hookName]
      if (hook) {
        try {

          const result = await (hook as any)(...args)
          results.push(result)
        } catch (error) {
          // Log plugin error but continue with other plugins
          const err = error as Error
          console.error(`[PluginManager] Error in plugin "${plugin.name}" hook "${hookName}":`, err.message)

          // If this is the onError hook itself, don't call it recursively
          if (hookName !== "onError") {
            // Call onError hooks to notify other plugins
            await this.callHook("onError", err)
          }

          // Continue with other plugins instead of failing entirely
        }
      }
    }

    return results
  }

  /**
   * Clear all plugins
   */
  async clear(): Promise<void> {
    for (const pluginName of Array.from(this.plugins.keys())) {
      await this.unregister(pluginName)
    }
  }
}

/**
 * Helper to create a plugin
 */
export function definePlugin(plugin: Plugin): Plugin {
  return plugin
}
