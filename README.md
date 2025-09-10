# Jules Link Testing Tool

A simple, single-file solution for testing links and URLs. This tool allows you to quickly verify that your links are working correctly by checking HTTP status codes, response times, and handling redirects.

## Features

- ✅ Test multiple URLs in a single run
- ✅ Check HTTP status codes
- ✅ Measure response times
- ✅ Handle redirects automatically
- ✅ Colorized output for easy reading
- ✅ Self-contained in a single JavaScript file
- ✅ No external dependencies required

## Quick Start

1. **Run the tests:**
   ```bash
   node link-test.js
   ```

2. **Or make it executable and run directly:**
   ```bash
   chmod +x link-test.js
   ./link-test.js
   ```

## Adding Your Test Cases

Edit the `TEST_CASES` array in `link-test.js` to add your own URLs to test:

```javascript
const TEST_CASES = [
    {
        url: 'https://your-website.com',
        expectedStatus: 200,
        description: 'Your website homepage',
        maxResponseTime: 3000
    },
    {
        url: 'https://your-api.com/health',
        expectedStatus: 200,
        description: 'API health check',
        maxResponseTime: 2000
    },
    {
        url: 'https://your-website.com/missing-page',
        expectedStatus: 404,
        description: 'Test 404 page',
        maxResponseTime: 3000
    }
];
```

### Test Case Options

- **url** (required): The URL to test
- **expectedStatus** (optional, default: 200): Expected HTTP status code
- **description** (optional): Human-readable description of the test
- **maxResponseTime** (optional, default: 5000): Maximum acceptable response time in milliseconds

## Example Output

```
Jules Link Testing Tool
Running 3 test case(s)...
==================================================

Testing: Your website homepage
URL: https://your-website.com
✓ Status: 200 OK (expected: 200)
✓ Response Time: 1247ms (max: 3000ms)
ℹ Content Length: 15234 bytes

Testing: API health check
URL: https://your-api.com/health
✓ Status: 200 OK (expected: 200)
✓ Response Time: 456ms (max: 2000ms)
ℹ Content Length: 25 bytes

==================================================
Test Summary:
✓ Passed: 2
✗ Failed: 0
Total: 2
==================================================
```

## Configuration

You can modify the `TEST_CONFIG` object at the top of the file to adjust global settings:

```javascript
const TEST_CONFIG = {
    timeout: 10000,           // Request timeout in milliseconds
    userAgent: 'Jules-Link-Tester/1.0',  // User agent string
    followRedirects: true,    // Whether to follow redirects
    maxRedirects: 5          // Maximum number of redirects to follow
};
```

## Requirements

- Node.js (any recent version)
- No additional npm packages required - uses only Node.js built-in modules

## Exit Codes

- **0**: All tests passed
- **1**: One or more tests failed

This makes it easy to use in CI/CD pipelines or automated scripts.