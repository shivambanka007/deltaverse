#!/usr/bin/env node

/**
 * DeltaVerse API Test Runner
 * Automated testing script for the DeltaVerse API using Newman (Postman CLI)
 * 
 * Usage:
 *   npm install -g newman
 *   node run_api_tests.js [environment]
 * 
 * Environments: development, production
 */

const newman = require('newman');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  development: {
    collection: './DeltaVerse_API_Collection.postman_collection.json',
    environment: './DeltaVerse_Development.postman_environment.json',
    baseUrl: 'http://localhost:8000',
    fiMcpUrl: 'http://localhost:8080'
  },
  production: {
    collection: './DeltaVerse_API_Collection.postman_collection.json',
    environment: './DeltaVerse_Production.postman_environment.json',
    baseUrl: 'https://api.deltaverse.app',
    fiMcpUrl: 'https://fi-mcp.deltaverse.app'
  }
};

// Test scenarios to run
const TEST_SCENARIOS = [
  {
    name: 'Health Check',
    folder: '🔐 Authentication',
    critical: true
  },
  {
    name: 'Fi-MCP Server Status',
    folder: '🔐 Authentication',
    critical: true
  },
  {
    name: 'Get Financial Health Score',
    folder: '📊 Financial Health',
    critical: true
  },
  {
    name: 'Send Chat Message',
    folder: '🤖 AI Chat',
    critical: false
  },
  {
    name: 'Test Scenario: All Assets Connected',
    folder: '🧪 Test Scenarios',
    critical: false
  }
];

class APITestRunner {
  constructor(environment = 'development') {
    this.environment = environment;
    this.config = CONFIG[environment];
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
    
    if (!this.config) {
      throw new Error(`Unknown environment: ${environment}`);
    }
    
    console.log(`🚀 DeltaVerse API Test Runner`);
    console.log(`📍 Environment: ${environment}`);
    console.log(`🌐 Base URL: ${this.config.baseUrl}`);
    console.log(`🔗 Fi-MCP URL: ${this.config.fiMcpUrl}`);
    console.log('─'.repeat(50));
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...');
    
    // Check if collection file exists
    if (!fs.existsSync(this.config.collection)) {
      throw new Error(`Collection file not found: ${this.config.collection}`);
    }
    
    // Check if environment file exists
    if (!fs.existsSync(this.config.environment)) {
      throw new Error(`Environment file not found: ${this.config.environment}`);
    }
    
    // Check if servers are running (development only)
    if (this.environment === 'development') {
      await this.checkServerHealth();
    }
    
    console.log('✅ Prerequisites check passed');
  }

  async checkServerHealth() {
    const http = require('http');
    
    return new Promise((resolve, reject) => {
      const req = http.get(`${this.config.baseUrl}/health`, (res) => {
        if (res.statusCode === 200) {
          console.log('✅ DeltaVerse API server is running');
          resolve();
        } else {
          reject(new Error(`API server returned status: ${res.statusCode}`));
        }
      });
      
      req.on('error', (err) => {
        reject(new Error(`API server not reachable: ${err.message}`));
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('API server health check timeout'));
      });
    });
  }

  async runTests() {
    console.log('🧪 Running API tests...');
    
    return new Promise((resolve, reject) => {
      newman.run({
        collection: this.config.collection,
        environment: this.config.environment,
        reporters: ['cli', 'json'],
        reporter: {
          json: {
            export: `./test-results-${this.environment}-${Date.now()}.json`
          }
        },
        insecure: true, // Allow self-signed certificates in development
        timeout: 30000, // 30 second timeout
        delayRequest: 1000, // 1 second delay between requests
        iterationCount: 1,
        bail: false // Continue on failures
      }, (err, summary) => {
        if (err) {
          reject(err);
          return;
        }
        
        this.processSummary(summary);
        resolve(summary);
      });
    });
  }

  processSummary(summary) {
    console.log('─'.repeat(50));
    console.log('📊 Test Results Summary');
    console.log('─'.repeat(50));
    
    const stats = summary.run.stats;
    
    console.log(`📋 Total Requests: ${stats.requests.total}`);
    console.log(`✅ Passed: ${stats.requests.total - stats.requests.failed}`);
    console.log(`❌ Failed: ${stats.requests.failed}`);
    console.log(`⏱️  Average Response Time: ${stats.requests.average}ms`);
    
    // Process test results
    if (summary.run.failures && summary.run.failures.length > 0) {
      console.log('\n❌ Failed Tests:');
      summary.run.failures.forEach((failure, index) => {
        console.log(`${index + 1}. ${failure.source.name || 'Unknown'}`);
        console.log(`   Error: ${failure.error.message}`);
      });
    }
    
    // Process assertions
    if (summary.run.stats.assertions) {
      const assertions = summary.run.stats.assertions;
      console.log(`\n🧪 Assertions: ${assertions.total} total, ${assertions.failed} failed`);
    }
    
    this.results = {
      total: stats.requests.total,
      passed: stats.requests.total - stats.requests.failed,
      failed: stats.requests.failed,
      averageResponseTime: stats.requests.average,
      success: stats.requests.failed === 0
    };
  }

  generateReport() {
    const reportPath = `./api-test-report-${this.environment}-${Date.now()}.md`;
    
    const report = `# DeltaVerse API Test Report

## Environment: ${this.environment}
**Date:** ${new Date().toISOString()}
**Base URL:** ${this.config.baseUrl}
**Fi-MCP URL:** ${this.config.fiMcpUrl}

## Summary
- **Total Requests:** ${this.results.total}
- **Passed:** ${this.results.passed}
- **Failed:** ${this.results.failed}
- **Success Rate:** ${((this.results.passed / this.results.total) * 100).toFixed(2)}%
- **Average Response Time:** ${this.results.averageResponseTime}ms

## Test Status
${this.results.success ? '✅ All tests passed!' : '❌ Some tests failed'}

## Recommendations
${this.environment === 'development' ? `
- Ensure Fi-MCP server is running on ${this.config.fiMcpUrl}
- Check that all required environment variables are set
- Verify Firebase authentication is properly configured
` : `
- Monitor production API performance
- Check Firebase authentication tokens
- Verify Fi-MCP production server connectivity
`}

---
Generated by DeltaVerse API Test Runner
`;

    fs.writeFileSync(reportPath, report);
    console.log(`📄 Test report generated: ${reportPath}`);
  }

  async run() {
    try {
      await this.checkPrerequisites();
      await this.runTests();
      this.generateReport();
      
      console.log('\n🎉 Test run completed!');
      
      if (this.results.success) {
        console.log('✅ All tests passed successfully');
        process.exit(0);
      } else {
        console.log('❌ Some tests failed - check the report for details');
        process.exit(1);
      }
      
    } catch (error) {
      console.error('💥 Test run failed:', error.message);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const environment = process.argv[2] || 'development';
  
  try {
    const runner = new APITestRunner(environment);
    await runner.run();
  } catch (error) {
    console.error('💥 Failed to initialize test runner:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = APITestRunner;
