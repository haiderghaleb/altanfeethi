import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { fromEnv } from '@aws-sdk/credential-providers';
import { NextRequest, NextResponse } from 'next/server';

// Validate AWS credentials
function validateAWSCredentials() {
  const requiredEnvVars = ['AMAZON_ACCESS_KEY_ID', 'AMAZON_SECRET_ACCESS_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing AWS credentials: ${missingVars.join(', ')}. Please check your .env.local file.`);
  }
}

// Initialize Bedrock client
let client: BedrockRuntimeClient;
try {
  validateAWSCredentials();
  client = new BedrockRuntimeClient({
    region: 'eu-west-1',
    credentials: fromEnv(),
  });
} catch (error) {
  console.error('AWS Bedrock client initialization failed:', error);
}

export async function POST(request: NextRequest) {
  try {
    // Check if client is initialized
    if (!client) {
      return NextResponse.json(
        { 
          error: 'AWS Bedrock is not properly configured. Please check your AWS credentials in .env.local file.',
          details: 'Make sure AMAZON_ACCESS_KEY_ID, AMAZON_SECRET_ACCESS_KEY, and AMAZON_REGION are set correctly.'
        },
        { status: 500 }
      );
    }

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Using Claude Sonnet 4 with EU inference profile
    const modelId = 'eu.anthropic.claude-sonnet-4-20250514-v1:0';
    
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1000,
      system: 'You are an expert travel planner and advisor with extensive knowledge of destinations worldwide. Your role is to create detailed, personalized trip plans for travelers visiting any city for any duration. When users provide a destination and travel dates (start to end), create comprehensive itineraries that include:\n\n- Daily schedules with recommended activities, attractions, and experiences\n- Local dining recommendations for breakfast, lunch, and dinner\n- Transportation options and logistics\n- Accommodation suggestions based on different budgets\n- Cultural insights and local customs to be aware of\n- Weather considerations and packing recommendations\n- Budget estimates for different spending levels\n- Safety tips and important local information\n- Alternative options for different interests (adventure, culture, relaxation, etc.)\n\nAlways ask clarifying questions about preferences, budget, travel style, and interests to provide the most relevant recommendations. Be enthusiastic, knowledgeable, and helpful in creating memorable travel experiences.',
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    };

    // Enhanced retry configuration for handling throttling with longer delays
    const maxRetries = 5;
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
      try {
        const command = new InvokeModelCommand({
          modelId,
          body: JSON.stringify(payload),
          contentType: 'application/json',
          accept: 'application/json',
        });

        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

        return NextResponse.json({
          response: responseBody.content[0].text,
          model: modelId,
        });
      } catch (error: unknown) {
        // Handle throttling errors with enhanced exponential backoff
         if (error instanceof Error && error.name === 'ThrottlingException' && retryCount < maxRetries) {
           const backoffTime = Math.pow(2, retryCount) * 2000 + Math.random() * 1000; // Enhanced backoff with jitter
           console.log(`Throttling detected, retrying in ${Math.round(backoffTime)}ms (attempt ${retryCount + 1}/${maxRetries + 1})`);
           await new Promise(resolve => setTimeout(resolve, backoffTime));
           retryCount++;
           continue;
         }
        
        // If not a throttling error or max retries reached, handle the error
         console.error('Bedrock API error:', error);
         
         // Handle specific AWS errors
         if (error instanceof Error) {
      console.error('Bedrock API error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      if (error.name === 'ValidationException') {
        console.error('ValidationException details:', error.message);
        return NextResponse.json(
          { 
            error: 'Invalid request format for Bedrock API',
            details: error.message
          },
          { status: 400 }
        );
      }
      if (error.name === 'AccessDeniedException') {
        return NextResponse.json(
          { 
            error: 'Access denied to AWS Bedrock',
            details: 'Check your AWS credentials and ensure you have bedrock:InvokeModel permissions. Also verify that Claude model access is enabled in your AWS Bedrock console.'
          },
          { status: 401 }
        );
      }
      if (error.name === 'ThrottlingException') {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      if (error.name === 'ResourceNotFoundException') {
        return NextResponse.json(
          { 
            error: 'Model not found',
            details: 'The Claude model may not be available in your region or you may not have access to it. Check your AWS Bedrock console.'
          },
          { status: 404 }
        );
      }
      if (error.message.includes('credentials')) {
        return NextResponse.json(
          { 
            error: 'AWS credentials error',
            details: 'Please check your .env.local file and ensure AMAZON_ACCESS_KEY_ID and AMAZON_SECRET_ACCESS_KEY are correctly set.'
          },
          { status: 401 }
        );
      }
    }

         return NextResponse.json(
           { error: 'Failed to get response from AI model' },
           { status: 500 }
         );
       }
     }
   } catch (error: unknown) {
     console.error('Unexpected error:', error);
     return NextResponse.json(
       { error: 'Internal server error' },
       { status: 500 }
     );
   }
 }