// Test authentication persistence
const testAuthPersistence = () => {
  console.log('🔐 Testing Authentication Persistence...\n');

  // Check if auth token exists
  const token = localStorage.getItem('authToken');
  
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
testAuthPersistence();
