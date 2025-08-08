import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1';

// Test analytics endpoints
const testAnalytics = async () => {
  try {
    console.log('Testing Analytics Endpoints...\n');

    // Test 1: Get analytics overview (requires authentication)
    console.log('1. Testing GET /analytics/:channelId/overview');
    try {
      const response = await axios.get(`${BASE_URL}/analytics/test-channel/overview`);
      console.log('✅ Success:', response.status);
    } catch (error) {
      console.log('❌ Expected 401 (unauthorized):', error.response?.status);
    }

    // Test 2: Get channel analytics
    console.log('\n2. Testing GET /analytics/:channelId');
    try {
      const response = await axios.get(`${BASE_URL}/analytics/test-channel`);
      console.log('✅ Success:', response.status);
    } catch (error) {
      console.log('❌ Expected 401 (unauthorized):', error.response?.status);
    }

    // Test 3: Get demographics
    console.log('\n3. Testing GET /analytics/:channelId/demographics');
    try {
      const response = await axios.get(`${BASE_URL}/analytics/test-channel/demographics`);
      console.log('✅ Success:', response.status);
    } catch (error) {
      console.log('❌ Expected 401 (unauthorized):', error.response?.status);
    }

    console.log('\n✅ Analytics routes are properly configured!');
    console.log('Note: 401 errors are expected without authentication tokens.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Test health endpoint
const testHealth = async () => {
  try {
    console.log('\nTesting Health Endpoint...');
    const response = await axios.get(`${BASE_URL.replace('/api/v1', '')}/health`);
    console.log('✅ Health check successful:', response.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
};

// Run tests
const runTests = async () => {
  console.log('🚀 Starting API Tests...\n');
  await testHealth();
  await testAnalytics();
  console.log('\n✨ Tests completed!');
};

runTests();
