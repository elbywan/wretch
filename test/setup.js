// Jest setup to ensure fetch is available in the test environment
if (typeof globalThis.fetch === 'undefined') {
  // If fetch is not available, try to import it from the global scope
  if (typeof global.fetch !== 'undefined') {
    globalThis.fetch = global.fetch;
  } else {
    // As a fallback, create a minimal mock
    globalThis.fetch = () => Promise.resolve({
      ok: true,
      status: 200,
      text: () => Promise.resolve(''),
      json: () => Promise.resolve({}),
    });
  }
}