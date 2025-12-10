import { BedrockAgentEvent, BedrockAgentResponse } from './types';

export const handler = async (event: BedrockAgentEvent): Promise<BedrockAgentResponse> => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const { actionGroup, apiPath, parameters } = event;
  
  let result: any;

  try {
    if (apiPath === '/sayHello') {
      const name = parameters.find(p => p.name === 'name')?.value;
      const greeting = name 
        ? `Hello, ${name}! Welcome to AWS Bedrock Agent.`
        : 'Hello, World! Welcome to AWS Bedrock Agent.';
      result = { message: greeting };
    } else {
      throw new Error(`Unknown API path: ${apiPath}`);
    }

    return {
      messageVersion: '1.0',
      response: {
        actionGroup,
        apiPath,
        httpMethod: event.httpMethod,
        httpStatusCode: 200,
        responseBody: {
          'application/json': {
            body: JSON.stringify(result)
          }
        }
      }
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      messageVersion: '1.0',
      response: {
        actionGroup,
        apiPath,
        httpMethod: event.httpMethod,
        httpStatusCode: 500,
        responseBody: {
          'application/json': {
            body: JSON.stringify({ error: (error as Error).message })
          }
        }
      }
    };
  }
};
