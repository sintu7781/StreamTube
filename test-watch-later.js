// Test script to verify watch later API
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api/v1';

async function testWatchLaterAPI() {
  try {
    // First, you'll need to set up authentication
    console.log('Testing Watch Later API endpoints...\n');
    
    // Note: These tests require authentication token
    const authToken = 'YOUR_AUTH_TOKEN_HERE'; // Replace with actual token
    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };

    // Test 1: Get all videos to pick a test video
    console.log('1. Fetching all videos to get a test video...');
    const videosResponse = await axios.get(`${API_BASE_URL}/videos`);
    const videos = videosResponse.data.data.videos;
    
    if (videos.length === 0) {
      console.log('No videos found. Please upload some videos first.');
      return;
    }
    
    const testVideoId = videos[0]._id;
    console.log(`Using test video: ${videos[0].title} (ID: ${testVideoId})\n`);

    // Test 2: Add video to watch later
    console.log('2. Adding video to watch later...');
    try {
      const addResponse = await axios.post(
        `${API_BASE_URL}/watch-later/${testVideoId}`,
        { notes: 'Test note' },
        { headers }
      );
      console.log('✅ Video added to watch later successfully');
      console.log(`   Response: ${addResponse.data.message}\n`);
    } catch (error) {
      console.log('❌ Failed to add video to watch later');
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }

    // Test 3: Check if video is in watch later
    console.log('3. Checking watch later status...');
    try {
      const statusResponse = await axios.get(
        `${API_BASE_URL}/watch-later/${testVideoId}/status`,
        { headers }
      );
      console.log('✅ Status check successful');
      console.log(`   Is in watch later: ${statusResponse.data.data.isInWatchLater}\n`);
    } catch (error) {
      console.log('❌ Failed to check status');
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }

    // Test 4: Get watch later list
    console.log('4. Getting watch later list...');
    try {
      const listResponse = await axios.get(
        `${API_BASE_URL}/watch-later`,
        { headers }
      );
      console.log('✅ Watch later list retrieved successfully');
      console.log(`   Total videos: ${listResponse.data.data.videos.length}`);
      console.log(`   Pagination: Page ${listResponse.data.data.pagination.currentPage} of ${listResponse.data.data.pagination.totalPages}\n`);
    } catch (error) {
      console.log('❌ Failed to get watch later list');
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }

    // Test 5: Get watch later stats
    console.log('5. Getting watch later statistics...');
    try {
      const statsResponse = await axios.get(
        `${API_BASE_URL}/watch-later/stats`,
        { headers }
      );
      console.log('✅ Watch later stats retrieved successfully');
      console.log(`   Total videos: ${statsResponse.data.data.totalVideos}`);
      console.log(`   Total duration: ${Math.round((statsResponse.data.data.totalDuration || 0) / 60)} minutes\n`);
    } catch (error) {
      console.log('❌ Failed to get watch later stats');
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }

    // Test 6: Toggle video (should remove it)
    console.log('6. Toggling video in watch later...');
    try {
      const toggleResponse = await axios.post(
        `${API_BASE_URL}/watch-later/${testVideoId}/toggle`,
        {},
        { headers }
      );
      console.log('✅ Video toggled successfully');
      console.log(`   Is now in watch later: ${toggleResponse.data.data.isInWatchLater}\n`);
    } catch (error) {
      console.log('❌ Failed to toggle video');
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }

    console.log('Watch Later API test completed!');
    console.log('\nNOTE: To run these tests, you need to:');
    console.log('1. Replace YOUR_AUTH_TOKEN_HERE with a valid JWT token');
    console.log('2. Make sure the backend server is running on localhost:8000');
    console.log('3. Have at least one video uploaded to test with');

  } catch (error) {
    console.error('Error during API testing:');
    console.error(error.response?.data || error.message);
  }
}

// Show usage instructions if no auth token is provided
const hasAuthToken = process.argv[2];
if (!hasAuthToken) {
  console.log('Watch Later API Test Script');
  console.log('============================\n');
  console.log('Usage: node test-watch-later.js <auth-token>');
  console.log('Example: node test-watch-later.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n');
  console.log('To get an auth token:');
  console.log('1. Login through the frontend');
  console.log('2. Check localStorage for "accessToken"');
  console.log('3. Use that token as the argument\n');
} else {
  // Update the auth token and run tests
  testWatchLaterAPI();
}
