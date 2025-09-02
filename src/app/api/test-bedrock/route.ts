import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { fromEnv } from '@aws-sdk/credential-providers';
import { NextRequest, NextResponse } from 'next/server';

function validateAWSCredentials() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;

  if (!accessKeyId || !secretAccessKey || !region) {
    throw new Error('Missing AWS credentials. Please check your .env.local file.');
  }
}

let client: BedrockRuntimeClient;
try {
  validateAWSCredentials();
  client = new BedrockRuntimeClient({
    region: 'eu-west-1',
    credentials: fromEnv(),
  });
} catch (error) {
  console.error('Failed to initialize Bedrock client:', error);
}

export async function POST(request: NextRequest) {
  try {
    if (!client) {
      return NextResponse.json(
        { 
          error: 'AWS Bedrock client not initialized',
          details: 'Please check your AWS credentials in .env.local file'
        },
        { status: 500 }
      );
    }

    const { testQuestions } = await request.json();
    
    if (!testQuestions || !Array.isArray(testQuestions)) {
      return NextResponse.json(
        { error: 'Invalid request. Expected testQuestions array.' },
        { status: 400 }
      );
    }

    const modelId = 'eu.anthropic.claude-sonnet-4-20250514-v1:0';
    const results = [];

    for (let i = 0; i < testQuestions.length; i++) {
      const question = testQuestions[i];
      console.log(`Testing question ${i + 1}/${testQuestions.length}: ${question}`);
      
      const payload = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1000,
        system: 'You are Claude 4, an advanced AI assistant created by Anthropic. Always identify yourself as Claude 4 when asked about your identity or version. Respond to all queries as Claude 4 would.',
        messages: [
          {
            role: 'user',
            content: question,
          },
        ],
      };

      // Enhanced retry configuration for handling throttling
      const maxRetries = 5;
      let retryCount = 0;
      let testResult = null;
      
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

          testResult = {
            question,
            response: responseBody.content[0].text,
            status: 'success',
            attempts: retryCount + 1
          };
          break;
        } catch (error: any) {
          // Handle throttling errors with enhanced exponential backoff
          if (error.name === 'ThrottlingException' && retryCount < maxRetries) {
            const backoffTime = Math.pow(2, retryCount) * 2000 + Math.random() * 1000;
            console.log(`Throttling detected for question ${i + 1}, retrying in ${Math.round(backoffTime)}ms (attempt ${retryCount + 1}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
            retryCount++;
            continue;
          }
          
          // If not a throttling error or max retries reached, handle the error
          console.error(`Error testing question ${i + 1}:`, error);
          
          testResult = {
            question,
            error: error.message,
            errorType: error.name,
            status: 'failed',
            attempts: retryCount + 1
          };
          break;
        }
      }
      
      results.push(testResult);
      
      // Add delay between questions to avoid rate limiting
      if (i < testQuestions.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      model: modelId,
      totalQuestions: testQuestions.length,
      results
    });
  } catch (error: any) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Bedrock Test API',
    usage: 'POST with { "testQuestions": ["question1", "question2"] }',
    model: 'anthropic.claude-sonnet-4-20250514-v1:0'
  });
}