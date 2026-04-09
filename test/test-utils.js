// Test utilities for both mocked and E2E testing
// Set E2E=true environment variable to run against real API
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { eq } from '../index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isE2E = process.env.E2E === 'true'

// Mock response registry
let mockRegistry = {}

// Original functions
const originalFetch = globalThis.fetch
const originalLog = console.log
const originalError = console.error

// Capture stdout during test execution
let capturedOutput = ''

/**
 * Load a fixture file from test/fixtures directory
 * @param {string} fileName - Name of the fixture file
 * @returns {object|string} Parsed JSON or raw content
 */
export function loadFixture(fileName) {
    const filePath = `${__dirname}/fixtures/${fileName}`
    const content = readFileSync(filePath, 'utf8')
    try {
        return JSON.parse(content)
    } catch {
        return content
    }
}

/**
 * Register a mock response for a specific endpoint and method
 * @param {string} path - API path (e.g., '/api/taxonomy/{uuid}')
 * @param {string} method - HTTP method (get, post, put, delete)
 * @param {object|string} response - Response data or fixture filename
 * @param {number} status - HTTP status code (default: 200)
 * @param {object} headers - Response headers
 */
export function mockResponse(path, method = 'get', response, status = 200, headers = {}) {
    const key = `${method.toUpperCase()} ${path}`
    // If response is a string ending in .json, load it as a fixture
    let responseData = response
    if (typeof response === 'string' && response.endsWith('.json')) {
        responseData = loadFixture(response)
    }

    mockRegistry[key] = {
        response: responseData,
        status,
        headers: { 'content-type': 'application/json', ...headers }
    }
}

/**
 * Set up mock mode for testing
 * All fetch requests will return mocked responses
 */
export function useMockMode() {
    if (isE2E) return console.warn('⚠️ E2E mode enabled via E2E=true. Mocking disabled.')

    // Override console.log to capture output
    capturedOutput = ''
    console.log = (...args) => {
        capturedOutput += args.join(' ') + '\n'
    }

    // Suppress error output in mock mode unless debug is set
    if (!process.env.DEBUG) {
        console.error = () => {}
    }

    globalThis.fetch = (url, options = {}) => {
        const method = (options.method || 'get').toUpperCase()
        const urlObj = new URL(url)
        const path = urlObj.pathname + urlObj.search

        if (process.env.DEBUG) {
            console.error(`[MOCK DEBUG] ${method} ${url} -> path: ${path}`)
        }

        // Try exact match first (with query string)
        let key = `${method} ${path}`
        let mockData = mockRegistry[key]

        // Try without query string
        if (!mockData && urlObj.search) {
            key = `${method} ${urlObj.pathname}`
            mockData = mockRegistry[key]
        }

        if (!mockData) {
            const available = Object.keys(mockRegistry).join('\n  ')
            const err = new Error(`No mock registered for ${method} ${path}\nAvailable mocks:\n  ${available}`)
            globalThis.console.error = originalError
            throw err
        }

        const { response, status, headers: respHeaders } = mockData

        // Handle different response types
        let responseBody = response
        if (typeof response === 'object') {
            responseBody = JSON.stringify(response)
        }

        // 204 and 205 responses should have no body
        if (status === 204 || status === 205) {
            responseBody = ''
        }

        // For location header (POST/PUT), set it appropriately
        let finalHeaders = { 'content-type': 'application/json', ...respHeaders }
        if (status === 201 || status === 200) {
            if (!finalHeaders.location && (method === 'POST' || method === 'PUT')) {
                // Generate a location URL based on the request
                finalHeaders.location = url
            }
        }

        // Build response object similar to real fetch Response
        const response_obj = new Response(responseBody, {
            status,
            headers: new Headers(finalHeaders),
            url
        })

        return Promise.resolve(response_obj)
    }
}

/**
 * Use E2E mode (real API calls)
 * Restores original fetch function
 */
export function useE2EMode() {
    globalThis.fetch = originalFetch
    console.log = originalLog
    console.error = originalError
}

/**
 * Get captured output from the last CLI execution
 * @returns {string} The captured console output
 */
export function getCapturedOutput() {
    return capturedOutput.trim()
}

/**
 * Clear captured output
 */
export function clearOutput() {
    capturedOutput = ''
}

/**
 * Call the eq CLI function directly (programmatic, not exec)
 * This bypasses the exec subprocess pattern for faster tests
 * @param {object} options - Command options
 * @returns {Promise} Resolves when CLI completes
 */
export function callCLI(options) {
    clearOutput()
    return new Promise((resolve, reject) => {
        try {
            const result = eq(options)

            // If result is a Promise, wait for it
            if (result && typeof result.then === 'function') {
                result.then(() => {
                    // Wait a tick for any final console.log calls
                    setImmediate(() => resolve(getCapturedOutput()))
                }).catch(reject)
            } else {
                // If not a promise, wait a bit for async operations
                // to complete (fetch, promises, etc.)
                setTimeout(() => resolve(getCapturedOutput()), 100)
            }
        } catch (err) {
            reject(err)
        }
    })
}

/**
 * Reset mock registry
 */
export function resetMocks() {
    mockRegistry = {}
}

// Export the E2E mode boolean
export { isE2E }

/**
 * Clean up - call after tests complete
 * We have to reset tests in between because some use `eq` calls
 * (e.g. help-test.js) even during mocked mode
 */
export function cleanup() {
    resetMocks()
    clearOutput()
    useE2EMode() // reset console.log & error, fetch
}
