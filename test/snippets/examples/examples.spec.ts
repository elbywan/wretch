/**
 * Test file to verify example plugins work correctly
 */
import { describe, it } from "node:test"
import assert from "node:assert"
import { SnippetRunner } from "../index.js"
import { loggingPlugin, createLoggingPlugin } from "./logging-plugin.js"
import { benchmarkPlugin, createBenchmarkPlugin } from "./benchmark-plugin.js"

describe("Example Plugins", () => {
  it("should load logging plugin without errors", async () => {
    const runner = new SnippetRunner({
      plugins: [loggingPlugin],
      showSuccess: false,
      showSkipped: false
    })

    await runner.initialize()
    const pluginManager = runner.getPluginManager()

    assert.ok(pluginManager.has("logging-plugin"), "Logging plugin should be registered")
  })

  it("should create custom logging plugin", async () => {
    const customLogger = createLoggingPlugin({
      logStart: true,
      logComplete: false,
      logErrors: true,
      mode: "collect"
    })

    const runner = new SnippetRunner({
      plugins: [customLogger],
      showSuccess: false,
      showSkipped: false
    })

    await runner.initialize()
    const pluginManager = runner.getPluginManager()

    assert.ok(pluginManager.has("logging-plugin"), "Custom logging plugin should be registered")
  })

  it("should load benchmark plugin without errors", async () => {
    const runner = new SnippetRunner({
      plugins: [benchmarkPlugin],
      showSuccess: false,
      showSkipped: false
    })

    await runner.initialize()
    const pluginManager = runner.getPluginManager()

    assert.ok(pluginManager.has("benchmark-plugin"), "Benchmark plugin should be registered")
  })

  it("should create custom benchmark plugin", async () => {
    const customBenchmark = createBenchmarkPlugin({
      threshold: 50,
      printPerTest: false,
      printSummary: false
    })

    const runner = new SnippetRunner({
      plugins: [customBenchmark],
      showSuccess: false,
      showSkipped: false
    })

    await runner.initialize()
    const pluginManager = runner.getPluginManager()

    assert.ok(pluginManager.has("benchmark-plugin"), "Custom benchmark plugin should be registered")
  })

  it("should register benchmark directive", async () => {
    const runner = new SnippetRunner({
      plugins: [benchmarkPlugin],
      showSuccess: false,
      showSkipped: false
    })

    await runner.initialize()
    const pluginManager = runner.getPluginManager()
    const directive = pluginManager.getDirective("benchmark")

    assert.ok(directive, "Benchmark directive should be registered")
    assert.strictEqual(directive.type, "control", "Benchmark should be a control directive")
    assert.strictEqual(directive.name, "benchmark", "Directive name should be benchmark")
  })

  it("should run snippet with benchmark directive", async () => {
    // Skip this test if vm.SourceTextModule is not available
    try {
      const vm = await import("vm")
      if (!vm.SourceTextModule) {
        console.log("Skipping test - vm.SourceTextModule not available")
        return
      }
    } catch {
      console.log("Skipping test - vm module issues")
      return
    }

    const runner = new SnippetRunner({
      plugins: [createBenchmarkPlugin({ printPerTest: false, printSummary: false })],
      showSuccess: false,
      showSkipped: false
    })

    await runner.initialize()

    // Create a test snippet with benchmark directive
    const testSnippet = {
      code: "const x = 42; x",
      language: "typescript",
      file: "test.md",
      line: 1,
      index: 0,
      directives: [
        { name: "benchmark", args: [], line: 0 },
        { name: "expectReturn", args: 42, line: 0 }
      ]
    }

    const results = await runner.runSnippets([testSnippet])

    assert.strictEqual(results.length, 1, "Should have one result")
    // Note: May fail if vm.SourceTextModule isn't available
  })

  it("should run snippet with both plugins", async () => {
    // Skip this test if vm.SourceTextModule is not available
    try {
      const vm = await import("vm")
      if (!vm.SourceTextModule) {
        console.log("Skipping test - vm.SourceTextModule not available")
        return
      }
    } catch {
      console.log("Skipping test - vm module issues")
      return
    }
    const runner = new SnippetRunner({
      plugins: [
        createLoggingPlugin({ mode: "collect", logErrors: true }),
        createBenchmarkPlugin({ printPerTest: false, printSummary: false })
      ],
      showSuccess: false,
      showSkipped: false
    })

    await runner.initialize()

    // Verify both plugins loaded
    const pluginManager = runner.getPluginManager()
    assert.ok(pluginManager.has("logging-plugin"), "Logging plugin should be loaded")
    assert.ok(pluginManager.has("benchmark-plugin"), "Benchmark plugin should be loaded")

    // Create a test snippet
    const testSnippet = {
      code: "const x = 100; x",
      language: "typescript",
      file: "test.md",
      line: 1,
      index: 0,
      directives: [
        { name: "benchmark", args: [], line: 0 },
        { name: "expectReturn", args: 100, line: 0 }
      ]
    }

    const results = await runner.runSnippets([testSnippet])

    assert.strictEqual(results.length, 1, "Should have one result")
    assert.strictEqual(results[0].passed, true, "Test should pass")
  })

  it("should cleanup plugins on runner cleanup", async () => {
    const runner = new SnippetRunner({
      plugins: [loggingPlugin, benchmarkPlugin],
      showSuccess: false,
      showSkipped: false
    })

    await runner.initialize()

    const pluginManager = runner.getPluginManager()
    assert.strictEqual(pluginManager.getAll().length, 2, "Should have 2 plugins loaded")

    await runner.cleanup()

    assert.strictEqual(pluginManager.getAll().length, 0, "Should have no plugins after cleanup")
  })
})
