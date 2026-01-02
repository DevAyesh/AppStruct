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

    // Log API key format (safely)
    console.log('Gemini API Key format check:', {
      length: apiKey.length,
      firstChars: apiKey.substring(0, 10) + '...'
    });

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Get the generative model
    // Using gemini-1.5-flash for speed and cost-effectiveness
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8000,
        topP: 0.8,
        topK: 40,
      }
    });

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

module.exports = { generateBlueprint };
