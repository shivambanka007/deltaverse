// Simple test to verify Fi-MCP integration
const testFiMcpIntegration = async () => {
  console.log('🧪 Testing Fi-MCP Integration...\n');
  
  // Test 1: Check if Fi-MCP server is running
  console.log('1. Testing Fi-MCP server connectivity...');
  try {
    const response = await fetch('http://localhost:8080/mcp/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Mcp-Session-Id': 'test-session-123'
      },
      body: JSON.stringify({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/list",
        "params": {}
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.login_url) {
        console.log('✅ Fi-MCP server is running and requires authentication');
        console.log(`   Login URL: ${result.login_url}`);
      } else if (result.result) {
        console.log('✅ Fi-MCP server is running and authenticated');
        console.log(`   Available tools: ${result.result.tools?.length || 0}`);
      }
    } else {
      console.log(`❌ Fi-MCP server returned status: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Fi-MCP server not reachable: ${error.message}`);
  }
  
  // Test 2: Check backend API
  console.log('\n2. Testing backend API...');
  try {
    const response = await fetch('http://localhost:8000/api/v1/financial-health/health');
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Backend API is running');
      console.log(`   Service: ${result.service}`);
    } else {
      console.log(`❌ Backend API returned status: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Backend API not reachable: ${error.message}`);
  }
  
  // Test 3: Check Fi-MCP status endpoint
  console.log('\n3. Testing Fi-MCP status endpoint...');
  try {
    const response = await fetch('http://localhost:8000/api/v1/financial-health/fi-mcp-status');
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Fi-MCP status endpoint working');
      console.log(`   Status: ${result.status}`);
      console.log(`   Message: ${result.message}`);
      if (result.login_url) {
        console.log(`   Login URL: ${result.login_url}`);
      }
    } else {
      console.log(`❌ Fi-MCP status endpoint returned status: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Fi-MCP status endpoint not reachable: ${error.message}`);
  }
  
  // Test 4: Check scenarios endpoint
  console.log('\n4. Testing scenarios endpoint...');
  try {
    const response = await fetch('http://localhost:8000/api/v1/financial-health/scenarios');
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Scenarios endpoint working');
      console.log(`   Available scenarios: ${result.length}`);
      if (result.length > 0) {
        console.log(`   First scenario: ${result[0].name} (${result[0].phone_number})`);
      }
    } else {
      console.log(`❌ Scenarios endpoint returned status: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Scenarios endpoint not reachable: ${error.message}`);
  }
  
  console.log('\n🏁 Integration test completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Start Fi-MCP server: cd fi-mcp-dev-master && FI_MCP_PORT=8080 go run .');
  console.log('2. Start backend: cd deltaverse-api && uvicorn app.main:app --reload --port 8000');
  console.log('3. Start frontend: cd deltaverse-ui && npm start');
  console.log('4. Visit http://localhost:3000/financial-health');
  console.log('5. Click "Connect to Fi" button');
  console.log('6. Use phone number from scenarios (e.g., 2222222222)');
  console.log('7. Enter any OTP when prompted');
};

// Run the test
testFiMcpIntegration().catch(console.error);
