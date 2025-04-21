const axios = require('axios');

const generateBlueprint = async (idea, platform) => {
  try {
    const prompt = `Generate a detailed technical blueprint for the following app idea:

App Idea: ${idea}
Target Platform: ${platform}

Please provide a comprehensive markdown document with the following sections:

# [App Name] Blueprint

## Project Summary
[Brief overview of the app concept and its main purpose]

## Tech Stack
- Frontend Technologies
- Backend Technologies
- Database
- DevOps/Deployment
- Third-party Services/APIs

## Core Features
[Detailed breakdown of main features with technical implementation notes]

## User Flows
[Key user journeys through the application]

## Data Models
[Database schema and relationships]

## API Endpoints
[List of main API routes and their purposes]

## Implementation Notes
[Technical considerations, potential challenges, and solutions]

## Development Timeline
[Estimated phases and milestones]

Please be specific, technical, and actionable in your response.`;

    // Get API key from environment
    const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY is not set in environment variables');
    }

    // Log API key format (safely)
    console.log('API Key format check:', {
      startsWithPrefix: apiKey.startsWith('sk-or-v1-'),
      length: apiKey.length,
      firstChars: apiKey.substring(0, 8) + '...'
    });

    // Create axios instance with default config
    const instance = axios.create({
      baseURL: 'https://api.openrouter.ai/api/v1',
      timeout: 60000,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/codeium/AppStruct',
        'Content-Type': 'application/json',
        'X-Title': 'AppStruct',
        'User-Agent': 'AppStruct/1.0.0'
      }
    });

    // First verify the API key
    console.log('Verifying API key...');
    try {
      const authCheck = await instance.get('/auth/key');
      console.log('API key verification:', authCheck.data);
    } catch (authError) {
      console.error('API key verification failed:', {
        status: authError.response?.status,
        message: authError.response?.data?.error?.message
      });
      throw new Error(`API key verification failed: ${authError.response?.data?.error?.message || authError.message}`);
    }

    // Make the generation request
    console.log('Making generation request...');
    const response = await instance.post('/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    // Log response info
    console.log('OpenRouter API response:', {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data,
      hasChoices: !!response.data?.choices
    });

    if (!response.data?.choices?.[0]?.message?.content) {
      console.error('Invalid response structure:', JSON.stringify(response.data, null, 2));
      throw new Error('Invalid response structure from OpenRouter API');
    }

    return response.data.choices[0].message.content;

  } catch (error) {
    // Log error details
    console.error('OpenRouter API Error:', {
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

    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error(`OpenRouter API authentication failed: ${error.response.data?.error?.message || 'Invalid API key'}`);
    }

    if (error.response?.status === 402) {
      throw new Error('OpenRouter API quota exceeded. Please check your usage limits.');
    }

    if (error.response?.status === 429) {
      throw new Error('OpenRouter API rate limit exceeded. Please try again later.');
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error('Could not connect to OpenRouter API. Please check your network settings and try again.');
    }

    // Pass through API error messages if available
    if (error.response?.data?.error) {
      throw new Error(`OpenRouter API Error: ${error.response.data.error.message || JSON.stringify(error.response.data.error)}`);
    }

    // Generic error
    throw new Error(`OpenRouter API Error: ${error.message}`);
  }
};

module.exports = { generateBlueprint };
