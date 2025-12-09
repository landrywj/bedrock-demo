import { BedrockAgentEvent, BedrockAgentResponse } from './types';

export const handler = async (event: BedrockAgentEvent): Promise<BedrockAgentResponse> => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const { actionGroup, apiPath, parameters } = event;
  
  let result: any;

  try {
    if (apiPath === '/checkOrderStatus') {
      const orderId = parameters.find(p => p.name === 'orderId')?.value;
      result = { orderId, status: 'Shipped', estimatedDelivery: '2024-01-15' };
    } else if (apiPath === '/processReturn') {
      const orderId = parameters.find(p => p.name === 'orderId')?.value;
      const reason = parameters.find(p => p.name === 'reason')?.value;
      result = { orderId, returnId: 'RET-' + Date.now(), status: 'Approved', reason };
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
