// Script to test the login API endpoint
import fetch from 'node-fetch';

async function testLoginApi() {
  try {
    console.log('Testing login API endpoint...');
    
    // Call the login API endpoint
    const response = await fetch('http://localhost:4321/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'simple@example.com',
        password: 'test123'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const text = await response.text();
    console.log('Response text:', text);
    
    try {
      const data = JSON.parse(text);
      console.log('Response data:', data);
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  } catch (error) {
    console.error('Error testing login API:', error);
  }
}

// Run the test
testLoginApi();
