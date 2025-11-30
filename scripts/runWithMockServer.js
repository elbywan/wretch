import { launch, stop } from "../test/mock.js"
import { spawn } from "child_process"

const PORT = 9876
const MAX_WAIT_TIME = 10000
const CHECK_INTERVAL = 100

/**
 * Wait for the mock server to be ready by polling the /ping endpoint
 */
async function waitForServer() {
  const startTime = Date.now()

  while (Date.now() - startTime < MAX_WAIT_TIME) {
    try {
      const response = await fetch(`http://localhost:${PORT}/ping`)
      if (response.ok) {
        console.log("Mock server is ready")
        return true
      }
    } catch (error) {
      // Server not ready yet, continue waiting
    }

    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL))
  }

  throw new Error(`Mock server failed to start within ${MAX_WAIT_TIME}ms`)
}

/**
 * Run a command and return a promise that resolves with the exit code
 */
function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true
    })

    child.on("error", reject)
    child.on("exit", code => {
      resolve(code ?? 0)
    })
  })
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error("Usage: node runWithMockServer.js <command> [args...]")
    process.exit(1)
  }

  // Start the mock server
  console.log("Starting mock server...")
  launch(PORT)

  let exitCode = 0

  try {
    // Wait for the server to be ready
    await waitForServer()

    // Run the command
    const [command, ...commandArgs] = args
    exitCode = await runCommand(command, commandArgs)
  } catch (error) {
    console.error("Error:", error.message)
    exitCode = 1
  } finally {
    // Stop the mock server
    console.log("Stopping mock server...")
    stop()
  }

  process.exit(exitCode)
}

main()
