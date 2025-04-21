require('dotenv').config();
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing API connection...');
    
    // Get and validate API key
    const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
    if (!apiKey) {
      throw new Error('API key is not set');
    }

    console.log('API Key format check:', {
      startsWithPrefix: apiKey.startsWith('sk-or-v1-'),
      length: apiKey.length,
      firstChars: apiKey.substring(0, 8) + '...'
    });

    const response = await fetch('https://api.openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': apiKey, // Send key directly without Bearer prefix
        'HTTP-Referer': 'https://github.com/codeium/AppStruct',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: "Say hello"
          }
        ]
      })
    });

    const data = await response.json();
    console.log('Response:', {
      status: response.status,
      statusText: response.statusText,
      data: data
    });

    if (!response.ok) {
      throw new Error(`API Error: ${data.error?.message || 'Unknown error'}`);
    }

  } catch (error) {
    console.error('Error:', {
      message: error.message,
      status: error.status,
      response: error.response?.data
    });
  }
}

// Run the test
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  DEEPSEEK_API_KEY_exists: !!process.env.DEEPSEEK_API_KEY,
  DEEPSEEK_API_KEY_format: process.env.DEEPSEEK_API_KEY ? 
    `${process.env.DEEPSEEK_API_KEY.substring(0, 8)}...` : null,
  DEEPSEEK_API_KEY_length: process.env.DEEPSEEK_API_KEY?.length
});

testAPI();
