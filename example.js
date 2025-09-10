#!/usr/bin/env node

/**
 * Example usage of Jules Link Testing Tool
 * This file shows how to use the link-test.js module
 */

const { runTest } = require('./link-test.js');

async function demonstrateUsage() {
    console.log('=== Jules Link Testing Tool - Example Usage ===\n');
    
    // Example: Testing a single URL
    const testCase = {
        url: 'https://github.com',
        expectedStatus: 200,
        description: 'GitHub homepage test',
        maxResponseTime: 5000
    };
    
    console.log('Testing a single URL:');
    try {
        const result = await runTest(testCase);
        console.log('\nResult:', {
            passed: result.passed,
            statusCode: result.statusCode,
            responseTime: result.responseTime + 'ms'
        });
    } catch (error) {
        console.error('Error running test:', error.message);
    }
}

// Run the demo if this file is executed directly
if (require.main === module) {
    demonstrateUsage();
}