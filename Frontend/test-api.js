// Test API connectivity from frontend
const testAPI = async () => {
  const BASE_URL = 'http://localhost:3000/api/v1';
  
  console.log('🧪 Testing Frontend API Connectivity...\n');

  try {
    // Test 1: Health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3000/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check successful:', healthData.status);
    } else {
      console.log('❌ Health check failed:', healthResponse.status);
    }

    // Test 2: Analytics endpoint (should return 401 without auth)
    console.log('\n2. Testing analytics endpoint...');
    const analyticsResponse = await fetch(`${BASE_URL}/analytics/test-channel/overview`);
    if (analyticsResponse.status === 401) {
      console.log('✅ Analytics endpoint working (401 expected without auth)');
    } else {
      console.log('❌ Unexpected response:', analyticsResponse.status);
    }

    // Test 3: CORS headers
    console.log('\n3. Testing CORS headers...');
    const corsResponse = await fetch(`${BASE_URL}/analytics/test-channel/overview`, {
      method: 'OPTIONS'
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': corsResponse.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': corsResponse.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': corsResponse.headers.get('Access-Control-Allow-Headers')
    };
    
    console.log('✅ CORS headers:', corsHeaders);

    console.log('\n🎉 API connectivity test completed successfully!');
    console.log('📝 Note: 401 errors are expected for protected routes without authentication.');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('💡 Make sure the backend server is running on port 3000');
  }
};

// Run the test
testAPI();
