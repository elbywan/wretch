import wretch from "../../src"

describe("Enhanced Error Handling", () => {
  const mockServer = "http://localhost:9876"

  it("should include request object in WretchError (issue #264)", async () => {
    let errorCaught: any = null
    
    try {
      await wretch(mockServer + "/404").get().res()
    } catch (error) {
      errorCaught = error
    }
    
    expect(errorCaught).not.toBeNull()
    expect(errorCaught.status).toBe(404)
    expect(errorCaught.request).toBeDefined()
    expect(errorCaught.request?.url).toContain("/404")
    expect(errorCaught.request?.method).toBe("GET")
  })

  it("should handle JSON parsing errors gracefully (issue #266)", async () => {
    let errorCaught: any = null
    
    try {
      // This endpoint returns plain text but we'll try to parse as JSON
      await wretch(mockServer + "/500")
        .errorType("json")
        .get()
        .res()
    } catch (error) {
      errorCaught = error
    }
    
    expect(errorCaught).not.toBeNull()
    expect(errorCaught.status).toBe(500)
    expect(errorCaught.text).toBeDefined() // Should contain the text
    expect(errorCaught.json).toBeUndefined() // JSON parsing should fail gracefully
  })

  it("should still parse valid JSON in error responses", async () => {
    let errorCaught: any = null
    
    try {
      await wretch(mockServer + "/json500")
        .errorType("json")
        .get()
        .res()
    } catch (error) {
      errorCaught = error
    }
    
    expect(errorCaught).not.toBeNull()
    expect(errorCaught.status).toBe(500)
    expect(errorCaught.text).toBeDefined()
    expect(errorCaught.json).toBeDefined()
    expect(errorCaught.json.error).toBe(500)
  })

  it("should handle errors gracefully even when Request object cannot be created", async () => {
    let errorCaught: any = null
    
    try {
      // Use relative URL that might not create a valid Request object
      await wretch("/404").get().res()
    } catch (error) {
      errorCaught = error
    }
    
    expect(errorCaught).not.toBeNull()
    expect(errorCaught.status).toBeDefined()
    expect(errorCaught.url).toBeDefined()
    // request may or may not be defined depending on URL validity
  })
})