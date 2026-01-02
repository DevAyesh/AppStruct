const { GoogleGenerativeAI } = require('@google/generative-ai');

const getPrompt = (idea, platform, detailLevel = 'full') => {
  if (detailLevel === 'brief') {
    return `Generate a concise technical blueprint for the following app idea:

App Idea: ${idea}
Target Platform: ${platform}

Please provide a brief, actionable markdown document with these sections:

# [App Name] Quick Blueprint

## 🎯 Project Summary
[2-3 sentence overview]

## 🛠 Tech Stack
- Frontend: [main framework]
- Backend: [main framework]
- Database: [type]
- Deployment: [platform]

## ⭐ Top 5 Features
1. [Feature 1] - brief implementation note
2. [Feature 2] - brief implementation note
3. [Feature 3] - brief implementation note
4. [Feature 4] - brief implementation note
5. [Feature 5] - brief implementation note

## 🚀 Quick Start Guide
[3-4 key steps to begin development]

Keep it concise and actionable. Focus on the essentials.`;
  }

  // Full detailed version
  return `Generate a detailed technical blueprint for the following app idea:

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
};

const generateBlueprint = async (idea, platform, detailLevel = 'full') => {
  try {
    const prompt = getPrompt(idea, platform, detailLevel);

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    // Log API key format (safely)
    console.log('Gemini API Key format check:', {
      length: apiKey.length,
      firstChars: apiKey.substring(0, 10) + '...'
    });

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Get the generative model
    // Use gemini-2.5-flash (faster, better quota limits)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8000,
        topP: 0.95,
      }
    });
    console.log('Using Gemini 2.5 Flash model');

    // Make the generation request to Gemini API
    console.log('Making generation request to Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Log response info
    console.log('Gemini API response:', {
      hasText: !!text,
      textLength: text?.length || 0
    });

    if (!text) {
      console.error('Empty response from Gemini API');
      throw new Error('Empty response from Gemini API');
    }

    console.log('Blueprint generated successfully!');
    return text;

  } catch (error) {
    // Log error details
    console.error('Gemini API Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Handle specific error cases
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid')) {
      throw new Error('Gemini API authentication failed: Invalid API key');
    }

    if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('Gemini API quota exceeded. Please check your usage limits at aistudio.google.com');
    }

    if (error.message?.includes('rate limit')) {
      throw new Error('Gemini API rate limit exceeded. Please try again in a moment.');
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error('Could not connect to Gemini API. Please check your network settings and try again.');
    }

    // Pass through the error message
    if (error.message) {
      throw new Error(`Gemini API Error: ${error.message}`);
    }

    // Generic error
    throw new Error('Gemini API Error: An unexpected error occurred');
  }
};

const generateBlueprintStream = async (idea, platform, detailLevel = 'full', onChunk) => {
  try {
    const prompt = getPrompt(idea, platform, detailLevel);

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Get the generative model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: detailLevel === 'brief' ? 2000 : 8000,
        topP: 0.95,
      }
    });
    console.log('Using Gemini 2.5 Flash model for streaming');

    // Generate content with streaming
    console.log('Starting streaming generation...');
    const result = await model.generateContentStream(prompt);

    // Stream the response
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        onChunk(chunkText);
      }
    }

    console.log('Blueprint streaming completed!');

  } catch (error) {
    // Log error details
    console.error('Gemini Streaming API Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Handle specific error cases
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid')) {
      throw new Error('Gemini API authentication failed: Invalid API key');
    }

    if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('Gemini API quota exceeded. Please check your usage limits at aistudio.google.com');
    }

    if (error.message?.includes('rate limit')) {
      throw new Error('Gemini API rate limit exceeded. Please try again in a moment.');
    }

    // Pass through the error message
    if (error.message) {
      throw new Error(`Gemini API Error: ${error.message}`);
    }

    // Generic error
    throw new Error('Gemini API Error: An unexpected error occurred');
  }
};

module.exports = { generateBlueprint, generateBlueprintStream };
