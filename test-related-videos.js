// Test script to verify related videos API
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api/v1';

async function testRelatedVideos() {
  try {
    // First, get all videos to pick a video ID
    console.log('Fetching all videos...');
    const videosResponse = await axios.get(`${API_BASE_URL}/videos`);
    const videos = videosResponse.data.data.videos;
    
    if (videos.length === 0) {
      console.log('No videos found. Please upload some videos first.');
      return;
    }
    
    const testVideo = videos[0];
    console.log(`Testing related videos for: ${testVideo.title} (ID: ${testVideo._id})`);
    
    // Test the related videos API
    const relatedResponse = await axios.get(`${API_BASE_URL}/videos/${testVideo._id}/related`);
    const relatedVideos = relatedResponse.data.data;
    
    console.log(`Found ${relatedVideos.length} related videos:`);
    relatedVideos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title} (Channel: ${video.channel?.name})`);
    });
    
  } catch (error) {
    console.error('Error testing related videos API:');
    console.error(error.response?.data || error.message);
  }
}

// Run the test
testRelatedVideos();
