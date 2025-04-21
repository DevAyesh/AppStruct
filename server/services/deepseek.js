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
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY is not set in environment variables');
    }

    // Log environment check
    console.log('Environment check:', {
      hasApiKey: !!apiKey,
      apiKeyStart: apiKey.substring(0, 10) + '...',
      apiKeyLength: apiKey.length
    });

    // Make the API request
    const response = await axios({
      method: 'POST',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/codeium/AppStruct'
      },
      data: {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }
    });

    // Log response info
    console.log('Response info:', {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data,
      dataKeys: Object.keys(response.data || {}),
      firstChoice: response.data?.choices?.[0] ? {
        hasMessage: !!response.data.choices[0].message,
        messageKeys: Object.keys(response.data.choices[0].message || {}),
        contentLength: response.data.choices[0].message?.content?.length
      } : null
    });

    // Validate response structure
    if (!response.data) {
      throw new Error('No data received from OpenRouter API');
    }

    if (!Array.isArray(response.data.choices)) {
      throw new Error('Invalid response format: choices array is missing');
    }

    if (!response.data.choices.length) {
      throw new Error('No completion choices received from OpenRouter API');
    }

    const firstChoice = response.data.choices[0];
    if (!firstChoice.message || typeof firstChoice.message.content !== 'string') {
      console.error('Unexpected response structure:', JSON.stringify(response.data, null, 2));
      throw new Error('Invalid message format in API response');
    }

    return firstChoice.message.content;
  } catch (error) {
    // Log the complete error for debugging
    console.error('API Call Error:', {
      message: error.message,
      code: error.code,
      response: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      },
      request: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        headers: {
          ...error.config?.headers,
          'Authorization': '[HIDDEN]'
        }
      }
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error('OpenRouter API authentication failed. Please check your API key.');
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error('Could not connect to OpenRouter API. Please check your internet connection.');
    }

    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      throw new Error(`OpenRouter API Error: ${apiError.message || JSON.stringify(apiError)}`);
    }

    // Generic error
    throw new Error(`OpenRouter API Error: ${error.message}`);
  }
};

module.exports = { generateBlueprint };
