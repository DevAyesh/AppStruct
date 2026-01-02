const axios = require('axios');
const dns = require('dns').promises;
const http = require('http');
const https = require('https');

// Force IPv4 resolution to avoid Railway DNS issues
dns.setDefaultResultOrder('ipv4first');

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
    console.log('DeepSeek API Key format check:', {
      length: apiKey.length,
      firstChars: apiKey.substring(0, 10) + '...'
    });

    // Create axios instance for DeepSeek API
    const httpsAgent = new https.Agent({
      family: 4, // Force IPv4
      keepAlive: true,
      timeout: 120000
    });

    const instance = axios.create({
      baseURL: 'https://api.deepseek.com',
      timeout: 120000,
      httpsAgent: httpsAgent,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Make the generation request to DeepSeek API
    console.log('Making generation request to DeepSeek...');
    const response = await instance.post('/chat/completions', {
      model: "deepseek-chat",
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
    console.log('DeepSeek API response:', {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data,
      hasChoices: !!response.data?.choices
    });

    if (!response.data?.choices?.[0]?.message?.content) {
      console.error('Invalid response structure:', JSON.stringify(response.data, null, 2));
      throw new Error('Invalid response structure from DeepSeek API');
    }

    return response.data.choices[0].message.content;

  } catch (error) {
    // Log error details
    console.error('DeepSeek API Error:', {
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
      throw new Error(`DeepSeek API authentication failed: ${error.response.data?.error?.message || 'Invalid API key'}`);
    }

    if (error.response?.status === 402) {
      throw new Error('DeepSeek API quota exceeded. Please check your usage limits.');
    }

    if (error.response?.status === 429) {
      throw new Error('DeepSeek API rate limit exceeded. Please try again later.');
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error('Could not connect to DeepSeek API. Please check your network settings and try again.');
    }

    // Pass through API error messages if available
    if (error.response?.data?.error) {
      throw new Error(`DeepSeek API Error: ${error.response.data.error.message || JSON.stringify(error.response.data.error)}`);
    }

    // Generic error
    throw new Error(`DeepSeek API Error: ${error.message}`);
  }
};

module.exports = { generateBlueprint };
