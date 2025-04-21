const axios = require('axios');

const API_KEY = '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';

async function testOpenRouter() {
  try {
    console.log('Making request to OpenRouter API...');
    
    const headers = {
      'Authorization': `Bearer ${API_KEY}`,
      'HTTP-Referer': 'https://github.com/codeium/AppStruct',
      'Content-Type': 'application/json',
      'X-Title': 'AppStruct Test',
      'User-Agent': 'Mozilla/5.0 AppStruct/1.0.0'
    };

    console.log('Request headers:', {
      ...headers,
      'Authorization': 'Bearer [HIDDEN]'
    });

    const data = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Say hello"
        }
      ],
      route: "openai",
      temperature: 0.7,
      max_tokens: 100
    };

    console.log('Request data:', data);

    const response = await axios({
      method: 'POST',
      url: 'https://api.openrouter.ai/api/v1/chat/completions',
      headers,
      data,
      validateStatus: (status) => status < 500
    });

    console.log('Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
  } catch (error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        headers: {
          ...error.config.headers,
          Authorization: '[HIDDEN]'
        }
      } : null
    });

    // Try to make a simple GET request to check API accessibility
    try {
      console.log('\nTrying simple GET request...');
      const checkResponse = await axios.get('https://api.openrouter.ai/api/v1/auth/key', {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });
      console.log('GET response:', checkResponse.data);
    } catch (checkError) {
      console.error('GET request failed:', {
        status: checkError.response?.status,
        data: checkError.response?.data
      });
    }
  }
}

testOpenRouter();
