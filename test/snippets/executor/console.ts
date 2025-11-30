/**
 * Console mocking utilities for capturing output during snippet execution
 */

/**
 * Create a mock console for capturing output
 */
export function createMockConsole(
  logs: string[],
  timers: Map<string, number>
): Partial<Console> {
  return {
    log: (...args: unknown[]) => logs.push(args.map(String).join(" ")),
    error: (...args: unknown[]) => logs.push(`ERROR: ${args.map(String).join(" ")}`),
    warn: (...args: unknown[]) => logs.push(`WARN: ${args.map(String).join(" ")}`),
    info: (...args: unknown[]) => logs.push(`INFO: ${args.map(String).join(" ")}`),
    debug: (...args: unknown[]) => logs.push(`DEBUG: ${args.map(String).join(" ")}`),
    trace: (...args: unknown[]) => logs.push(`TRACE: ${args.map(String).join(" ")}`),

    time: (label?: string) => {
      timers.set(label || "default", Date.now())
    },

    timeEnd: (label?: string) => {
      const start = timers.get(label || "default")
      if (start) {
        const duration = Date.now() - start
        logs.push(`${label || "default"}: ${duration}ms`)
        timers.delete(label || "default")
      }
    },

    timeLog: (label?: string, ...args: unknown[]) => {
      const start = timers.get(label || "default")
      if (start) {
        const duration = Date.now() - start
        const message = args.length > 0 ? ` ${args.map(String).join(" ")}` : ""
        logs.push(`${label || "default"}: ${duration}ms${message}`)
      }
    },

    // Stubs for other console methods
    dir: (...args: unknown[]) => logs.push(args.map(String).join(" ")),
    dirxml: (...args: unknown[]) => logs.push(args.map(String).join(" ")),
    table: (...args: unknown[]) => logs.push(args.map(String).join(" ")),
    group: () => {},
    groupCollapsed: () => {},
    groupEnd: () => {},
    clear: () => {},
    count: () => {},
    countReset: () => {},
    assert: () => {},
  }
}
