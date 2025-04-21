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

    // Verify API key is present
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY is not set in environment variables');
    }

    // First, get available models
    const modelsResponse = await axios({
      method: 'get',
      url: 'https://openrouter.ai/api/v1/models',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000'
      }
    });

    console.log('Available models:', modelsResponse.data);

    const config = {
      method: 'post',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AppStruct Blueprint Generator',
        'Content-Type': 'application/json'
      },
      data: {
        model: "mistralai/mistral-7b-instruct", // Fallback to Mistral as it's commonly available
        messages: [{
          role: "user",
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 2000
      }
    };

    console.log('Making request to OpenRouter with config:', {
      url: config.url,
      model: config.data.model,
      headers: {
        ...config.headers,
        'Authorization': 'Bearer ' + process.env.DEEPSEEK_API_KEY?.substring(0, 10) + '...'
      }
    });

    const response = await axios(config);

    console.log('OpenRouter API Response Status:', response.status);
    console.log('OpenRouter API Response Headers:', response.headers);
    
    if (response.data) {
      console.log('OpenRouter API Response Data Structure:', {
        hasChoices: !!response.data.choices,
        choicesLength: response.data.choices?.length,
        firstChoice: response.data.choices?.[0] ? 'present' : 'missing'
      });
    }

    if (!response.data?.choices?.[0]?.message?.content) {
      console.error('Invalid response structure:', JSON.stringify(response.data, null, 2));
      throw new Error('Invalid response structure from OpenRouter API');
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    // Log the complete error for debugging
    console.error('Full error object:', error);
    
    console.error('OpenRouter API Error Details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: {
        request: error.config?.headers,
        response: error.response?.headers
      }
    });

    if (error.response?.data?.error) {
      throw new Error(`OpenRouter API Error: ${error.response.data.error.message || JSON.stringify(error.response.data.error)}`);
    }

    // If it's a network error
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Could not connect to OpenRouter API. Please check your internet connection.');
    }

    // If it's an authentication error
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please check your OpenRouter API key.');
    }

    throw new Error(`OpenRouter API Error: ${error.message}`);
  }
};

module.exports = { generateBlueprint };
