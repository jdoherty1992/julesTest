#!/usr/bin/env node

/**
 * Jules Link Testing Tool
 * A single file solution for testing links/URLs
 * 
 * Usage: node link-test.js
 * Or make it executable: chmod +x link-test.js && ./link-test.js
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// ANSI color codes for output formatting
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

// Test configuration
const TEST_CONFIG = {
    timeout: 10000, // 10 seconds
    userAgent: 'Jules-Link-Tester/1.0',
    followRedirects: true,
    maxRedirects: 5
};

/**
 * Test cases - Add your links here
 * Each test case can have:
 * - url: The URL to test (required)
 * - expectedStatus: Expected HTTP status code (default: 200)
 * - description: Description of the test (optional)
 * - maxResponseTime: Maximum acceptable response time in ms (default: 5000)
 */
const TEST_CASES = [
    // Example test cases - replace with your actual URLs to test
    {
        url: 'https://www.google.com',
        expectedStatus: 200,
        description: 'Google homepage',
        maxResponseTime: 3000
    },
    {
        url: 'https://httpbin.org/status/200',
        expectedStatus: 200,
        description: 'HTTPBin 200 test',
        maxResponseTime: 5000
    },
    {
        url: 'https://httpbin.org/status/404',
        expectedStatus: 404,
        description: 'HTTPBin 404 test',
        maxResponseTime: 5000
    },
    {
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        expectedStatus: 200,
        description: 'JSON API test',
        maxResponseTime: 3000
    },
    {
        url: 'https://github.com',
        expectedStatus: 200,
        description: 'GitHub homepage',
        maxResponseTime: 5000
    }
    // Add more test cases here as needed
    // Example formats:
    // {
    //     url: 'https://example.com/api/health',
    //     expectedStatus: 200,
    //     description: 'API health check',
    //     maxResponseTime: 2000
    // },
    // {
    //     url: 'https://example.com/missing-page',
    //     expectedStatus: 404,
    //     description: 'Test 404 page',
    //     maxResponseTime: 3000
    // }
];

/**
 * Makes an HTTP request and returns a promise with the response details
 */
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        let parsedUrl;
        
        try {
            parsedUrl = new URL(url);
        } catch (error) {
            return reject(new Error(`Invalid URL: ${url}`));
        }

        const isHttps = parsedUrl.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const requestOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname + parsedUrl.search,
            method: 'GET',
            timeout: options.timeout || TEST_CONFIG.timeout,
            headers: {
                'User-Agent': options.userAgent || TEST_CONFIG.userAgent,
                'Accept': '*/*'
            }
        };

        const req = client.request(requestOptions, (res) => {
            const responseTime = Date.now() - startTime;
            
            // Handle redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                if (options.redirectCount >= (options.maxRedirects || TEST_CONFIG.maxRedirects)) {
                    return reject(new Error('Too many redirects'));
                }
                
                const redirectUrl = new URL(res.headers.location, url).href;
                return makeRequest(redirectUrl, { 
                    ...options, 
                    redirectCount: (options.redirectCount || 0) + 1 
                }).then(resolve).catch(reject);
            }

            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    statusMessage: res.statusMessage,
                    headers: res.headers,
                    responseTime,
                    contentLength: data.length,
                    url: url
                });
            });
        });

        req.on('error', (error) => {
            const responseTime = Date.now() - startTime;
            reject({
                error: error.message,
                responseTime,
                url: url
            });
        });

        req.on('timeout', () => {
            req.destroy();
            const responseTime = Date.now() - startTime;
            reject({
                error: 'Request timeout',
                responseTime,
                url: url
            });
        });

        req.end();
    });
}

/**
 * Runs a single test case
 */
async function runTest(testCase) {
    const {
        url,
        expectedStatus = 200,
        description = '',
        maxResponseTime = 5000
    } = testCase;

    console.log(`\n${colors.blue}Testing:${colors.reset} ${description || url}`);
    console.log(`${colors.blue}URL:${colors.reset} ${url}`);

    try {
        const result = await makeRequest(url);
        
        // Check status code
        const statusPassed = result.statusCode === expectedStatus;
        const statusIcon = statusPassed ? '✓' : '✗';
        const statusColor = statusPassed ? colors.green : colors.red;
        
        console.log(`${statusColor}${statusIcon} Status:${colors.reset} ${result.statusCode} ${result.statusMessage} (expected: ${expectedStatus})`);
        
        // Check response time
        const timePassed = result.responseTime <= maxResponseTime;
        const timeIcon = timePassed ? '✓' : '✗';
        const timeColor = timePassed ? colors.green : colors.yellow;
        
        console.log(`${timeColor}${timeIcon} Response Time:${colors.reset} ${result.responseTime}ms (max: ${maxResponseTime}ms)`);
        
        // Additional info
        console.log(`${colors.blue}ℹ Content Length:${colors.reset} ${result.contentLength} bytes`);
        
        return {
            passed: statusPassed && timePassed,
            url,
            description,
            statusCode: result.statusCode,
            responseTime: result.responseTime,
            errors: []
        };
        
    } catch (error) {
        console.log(`${colors.red}✗ Error:${colors.reset} ${error.error || error.message}`);
        if (error.responseTime) {
            console.log(`${colors.blue}ℹ Response Time:${colors.reset} ${error.responseTime}ms`);
        }
        
        return {
            passed: false,
            url,
            description,
            statusCode: null,
            responseTime: error.responseTime || null,
            errors: [error.error || error.message]
        };
    }
}

/**
 * Main test runner
 */
async function runAllTests() {
    console.log(`${colors.bold}${colors.blue}Jules Link Testing Tool${colors.reset}`);
    console.log(`${colors.blue}Running ${TEST_CASES.length} test case(s)...${colors.reset}`);
    console.log('='.repeat(50));

    const results = [];
    let passed = 0;
    let failed = 0;

    for (const testCase of TEST_CASES) {
        const result = await runTest(testCase);
        results.push(result);
        
        if (result.passed) {
            passed++;
        } else {
            failed++;
        }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log(`${colors.bold}Test Summary:${colors.reset}`);
    console.log(`${colors.green}✓ Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}✗ Failed: ${failed}${colors.reset}`);
    console.log(`${colors.blue}Total: ${TEST_CASES.length}${colors.reset}`);

    if (failed > 0) {
        console.log(`\n${colors.yellow}Failed Tests:${colors.reset}`);
        results.filter(r => !r.passed).forEach(result => {
            console.log(`  • ${result.description || result.url}: ${result.errors.join(', ')}`);
        });
    }

    console.log('='.repeat(50));
    
    // Exit with error code if any tests failed
    process.exit(failed > 0 ? 1 : 0);
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(error => {
        console.error(`${colors.red}Fatal error:${colors.reset}`, error);
        process.exit(1);
    });
}

// Export for potential use as a module
module.exports = {
    runTest,
    runAllTests,
    makeRequest,
    TEST_CASES,
    TEST_CONFIG
};