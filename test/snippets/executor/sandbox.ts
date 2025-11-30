/**
 * VM sandbox utilities for executing code in isolated contexts
 */

import * as vm from "node:vm"
import type { ModuleResolver } from "../types.js"

export interface SandboxOptions {
  /** Timeout in milliseconds */
  timeout: number
  /** Context globals */
  globals: Record<string, unknown>
  /** Module resolver function */
  moduleResolver?: ModuleResolver
  /** Identifier for the module (file:line) */
  identifier: string
}

export interface SandboxResult {
  /** Whether execution succeeded */
  success: boolean
  /** Error if execution failed */
  error?: Error
  /** Return value captured from globalThis.__snippetReturnValue */
  returnValue?: unknown
}

/**
 * Type for VM context with snippet globals
 */
interface SnippetContext extends Record<string, unknown> {
  __snippetReturnValue?: unknown
}

/**
 * Execute code in a VM sandbox
 */
export async function executeInSandbox(
  code: string,
  options: SandboxOptions
): Promise<SandboxResult> {
  const { timeout, globals, moduleResolver, identifier } = options

  try {
    // Create VM context
    const vmContext = vm.createContext(globals) as SnippetContext

    // Create and evaluate module
    const module = new vm.SourceTextModule(code, {
      context: vmContext,
      identifier,
    })

    // Link module with resolver
    if (moduleResolver) {
      await module.link(async specifier => {
        try {
          const imported = await moduleResolver(specifier)
          return createSyntheticModule(imported, vmContext)
        } catch (error) {
          const err = error as Error
          throw new Error(`Failed to resolve module "${specifier}": ${err.message}`)
        }
      })
    }

    // Evaluate with timeout
    await module.evaluate({ timeout })

    // Capture return value if set
    const returnValue = vmContext.__snippetReturnValue

    // If the return value is a promise, await it with timeout
    let finalReturnValue: unknown
    if (returnValue && typeof returnValue === "object" && "then" in returnValue) {
      finalReturnValue = await Promise.race([
        returnValue,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Return value promise timeout")), timeout)
        )
      ])
    } else {
      finalReturnValue = returnValue
    }

    return {
      success: true,
      returnValue: finalReturnValue,
    }
  } catch (error) {
    return {
      success: false,
      error: error as Error,
    }
  }
}

/**
 * Create a synthetic module for imports
 */
function createSyntheticModule(
  imported: unknown,
  context: vm.Context
): vm.SyntheticModule {
  const exportNames = ["default"]

  if (typeof imported === "object" && imported !== null) {
    exportNames.push(...Object.keys(imported).filter(k => k !== "default"))
  }

  const syntheticModule = new vm.SyntheticModule(
    exportNames,
    function() {
      if (typeof imported === "object" && imported !== null) {
        const importedObj = imported as Record<string, unknown>
        this.setExport("default", importedObj.default || imported)
        Object.keys(imported).forEach(key => {
          if (key !== "default") {
            this.setExport(key, importedObj[key])
          }
        })
      } else {
        this.setExport("default", imported)
      }
    },
    { context }
  )

  return syntheticModule
}
