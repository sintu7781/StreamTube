// Test channel data persistence
const testChannelPersistence = () => {
  console.log('🔐 Testing Channel Data Persistence...\n');

  // Check if auth token exists
  const token = localStorage.getItem('authToken');
  const savedChannel = localStorage.getItem('userChannel');
  
  if (token) {
    console.log('✅ Auth token found in localStorage');
    
    try {
      // Decode token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      
      if (payload.exp > now) {
        console.log('✅ Token is valid and not expired');
        console.log('📅 Token expires:', new Date(payload.exp * 1000).toLocaleString());
        console.log('👤 User data:', {
          email: payload.email,
          username: payload.username,
          id: payload._id
        });
      } else {
        console.log('❌ Token has expired');
      }
    } catch (error) {
      console.log('❌ Error decoding token:', error.message);
    }
  } else {
    console.log('❌ No auth token found in localStorage');
  }

  // Check channel data
  if (savedChannel) {
    console.log('\n✅ Channel data found in localStorage');
    try {
      const channelData = JSON.parse(savedChannel);
      console.log('📺 Channel data:', {
        name: channelData.name,
        handle: channelData.handle,
        id: channelData._id
      });
    } catch (error) {
      console.log('❌ Error parsing channel data:', error.message);
    }
  } else {
    console.log('\n❌ No channel data found in localStorage');
  }

  // Test API connectivity
  console.log('\n🌐 Testing API Connectivity...');
  
  fetch('http://localhost:3000/health')
    .then(response => response.json())
    .then(data => {
      console.log('✅ Backend health check successful:', data.status);
    })
    .catch(error => {
      console.log('❌ Backend health check failed:', error.message);
    });
};

// Run the test
testChannelPersistence();
