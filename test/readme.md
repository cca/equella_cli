# Testing Guide

Tests are **mocked** (no HTTP requests) by default, but can also run in **E2E (End-to-End)** mode against a real EQUELLA instance. Set an `E2E=true` env var to run E2E tests. Mocked tests are quicker and for use in CI, while E2E confirms actual EQUELLA behavior and identifies API changes.

Even during mocked mode, some tests shell out to `eq` (e.g. `help-test.js`) to verify CLI behavior, so we reset mocks and global state after each test suite to avoid interference. But there should be no HTTP requests while in mocked mode.

## Running Tests

```sh
npm test # run all tests in mocked mode
E2E=true npm test # run all tests in E2E mode
npm test -- test/item-xpath-test.js # run a specific test file
npm test -- --grep "find a taxonomy by its name" # run a specific test
```

## Architecture

### Test Utilities (`test/test-utils.js`)

The test utility module provides:

- **`isE2E`** - Boolean for current mode
- **`useMockMode()`** - Sets up network mocking for all HTTP requests
- **`mockResponse(path, method, response, status, headers)`** - Register a mock response
- **`loadFixture(fileName)`** - Load fixture data
- **`cleanup()`** - Clean up after tests
- **`resetMocks()`** - Clear all registered mocks, runs during cleanup
- **`useE2EMode()`** - Restores real HTTP requests, runs during cleanup

### Test Fixtures (`test/fixtures/`)

Fixture files contain:

- **Input data** - Files used for POST/PUT operations (e.g., `taxonomy.json`, `test-item.json`)
- **Response data** - Files with mock API responses (e.g., `taxonomy-response.json`, `search2-response.json`)

When adding mocked tests:

1. Create fixture files using real API response data
2. Before running tests, use `mockResponse()` to register them, e.g. `mockResponse('/api/taxonomies', 'get', 'taxonomy-response.json')`
3. Run tests using imported functions and not shelling out to `eq` (which is used in E2E mode)
4. Some tests may need a custom callback to verify results if `eq` is doing post-processing, e.g. the `item` endpoint parses XML with the `--xp` flag so `testXpath` in `item-xpath-test.js` verifies the parsed result instead of raw response

### Example: Mocked Test

```javascript
import { myFunction } from '../endpoints/my-module.js'
import { mockResponse, useMockMode, isE2E, cleanup } from './test-utils.js'

function myTest(done) {
    if (isE2E) {
        // Call code under test using exec to run eq command
        exec('eq my-command args', (err, stdout, stderr) => {
            assert.ok(stdout.includes('expected output'))
            done()
        })
    }
    else {
        // Register mock response first
        mockResponse('/api/endpoint', 'get', 'response-fixture.json')
        // Call code under test
        myFunction(options, (result) => {
            assert.ok(result)
            done()
        })
    }
}

describe("my endpoint", () => {
    if (isE2E) {
        before(useE2EMode)
    } else {
        before(useMockMode)
    }

    before(doSetup)
    after(doCleanup) // should call cleanup()
    it('should do something', myTest)
})
```

## Creating Mock Response Fixtures

1. Run `eq` & save response to fixture file: `eq endpoint --flag > test/fixtures/endpoint-flag.json`
2. Register mock in test: `mockResponse('/api/endpoint', 'get', 'endpoint-flag.json')`
3. Use the fixture in your test assertions

The fixtures go in `test/fixtures/`:

- Input fixtures (for POST/PUT): `test-item.json`, `test-term1.json`, etc.
- Response fixtures: `taxonomy-response.json`, `search2-response.json`, `group-response.json`, etc.

## Troubleshooting

### Tests fail with "No mock registered"

- You're in mocked mode but haven't registered a necessary mock response
- Use `eq` or `E2E=true npm test` to debug with the real API
- Check the error message for which endpoint needs mocking

### Tests hang or timeout

- Mocked mode should be fast; if tests are slow, you might be hitting real API
- Verify `useMockMode()` is called in `before()`
- Check for missing `await` or `.then()` in async code

### Different results in E2E vs mocked mode

- Mocked fixtures might be outdated
- Run `E2E=true npm test` again and update fixtures
- Check for hardcoded test UUIDs that might differ

## Best Practices

1. **Keep fixtures realistic** - Use actual API responses, not simplified versions
2. **Update fixtures when API changes** - Run E2E occasionally and update fixtures
3. **Version control fixtures** - Commit fixture files so they're consistent
4. **Document E2E requirements** - Note which UUIDs/collections tests need
5. **Use meaningful fixture names** - `taxonomy-search-response.json` is better than `response123.json`
6. **One fixture per scenario** - `group-response.json` and `group-updated-response.json` for different states
