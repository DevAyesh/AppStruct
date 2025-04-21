require('dotenv').config();
const axios = require('axios');

async function verifyKey() {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
    if (!apiKey) {
      throw new Error('API key not found in environment variables');
    }

    console.log('API Key format:', {
      length: apiKey.length,
      startsWith: apiKey.substring(0, 8) + '...',
      endsWidth: '...' + apiKey.substring(apiKey.length - 8)
    });

    console.log('\nVerifying API key...');
    
    const response = await axios({
      method: 'GET',
      url: 'https://api.openrouter.ai/api/v1/auth/key',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/codeium/AppStruct'
      }
    });

    console.log('\nAPI Key verification successful:', response.data);

    // Try a simple chat completion
    console.log('\nTesting chat completion...');
    const chatResponse = await axios({
      method: 'POST',
      url: 'https://api.openrouter.ai/api/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/codeium/AppStruct',
        'Content-Type': 'application/json'
      },
      data: {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: "Say hello"
          }
        ]
      }
    });

    console.log('\nChat completion successful:', {
      status: chatResponse.status,
      message: chatResponse.data.choices[0].message.content
    });

  } catch (error) {
    console.error('Error:', {
      name: error.name,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config ? {
        method: error.config.method,
        url: error.config.url,
        headers: {
          ...error.config.headers,
          Authorization: '[HIDDEN]'
        }
      } : null
    });
  }
}

verifyKey();
