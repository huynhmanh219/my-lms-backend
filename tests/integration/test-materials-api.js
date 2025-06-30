const jwt = require('jsonwebtoken');
const axios = require('axios');

async function testMaterialsAPI() {
  try {
    // Create a JWT token
    const token = jwt.sign(
      { id: 1, email: 'lecturer@lms.com', role: 'lecturer' },
      process.env.JWT_SECRET || 'your-secret-key-here'
    );
    
    console.log('🔑 Token created:', token.substring(0, 50) + '...');
    
    // Test materials API
    console.log('🧪 Testing materials API...');
    const response = await axios.get('http://localhost:3000/api/materials?page=1&size=5', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ API Error:', error.response?.status, error.response?.statusText);
    if (error.response?.data) {
      console.error('🔍 Error Details:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('🔍 Error Message:', error.message);
    }
  }
}

testMaterialsAPI(); 