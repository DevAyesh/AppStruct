const { GoogleGenerativeAI } = require('@google/generative-ai');

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
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    // Log API key format (safely) - removed in production for security
    if (process.env.NODE_ENV !== 'production') {
      console.log('API Key format check:', {
        isGeminiKey: apiKey.startsWith('AIza'),
        length: apiKey.length
      });
    }

    // Initialize Google Generative AI
    console.log('Initializing Google Gemini API...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Make the generation request
    console.log('Making generation request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Log response info
    console.log('Gemini API response:', {
      hasText: !!text,
      textLength: text?.length || 0
    });

    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    return text;

  } catch (error) {
    // Log error details
    console.error('Gemini API Error:', {
      name: error.name,
      message: error.message,
      status: error.status,
      statusText: error.statusText
    });

    // Handle specific error cases
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error('Gemini API authentication failed: Invalid API key');
    }

    if (error.message?.includes('QUOTA_EXCEEDED')) {
      throw new Error('Gemini API quota exceeded. Please check your usage limits.');
    }

    if (error.message?.includes('RATE_LIMIT')) {
      throw new Error('Gemini API rate limit exceeded. Please try again later.');
    }

    // Generic error
    throw new Error(`Gemini API Error: ${error.message}`);
  }
};

const generateBlueprintStream = async (idea, platform, detailLevel = 'full', onChunk) => {
  try {
    const basePrompt = `Generate a ${detailLevel === 'brief' ? 'concise' : 'detailed'} technical blueprint for the following app idea:

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
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    // Initialize Google Generative AI
    console.log('Initializing Google Gemini API for streaming...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    console.log('Making streaming generation request to Gemini...');
    const result = await model.generateContentStream(basePrompt);

    // Process the stream
    let buffer = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        buffer += chunkText;
        onChunk(chunkText);
      }
    }

    console.log('Stream completed, total length:', buffer.length);

  } catch (error) {
    console.error('Gemini Streaming API Error:', {
      name: error.name,
      message: error.message,
      status: error.status
    });

    // Handle specific error cases
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error('Gemini API authentication failed: Invalid API key');
    }

    if (error.message?.includes('QUOTA_EXCEEDED')) {
      throw new Error('Gemini API quota exceeded. Please check your usage limits.');
    }

    if (error.message?.includes('RATE_LIMIT')) {
      throw new Error('Gemini API rate limit exceeded. Please try again later.');
    }

    // Generic error
    throw new Error(`Gemini API Error: ${error.message}`);
  }
};

module.exports = { generateBlueprint, generateBlueprintStream };
