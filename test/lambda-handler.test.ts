import { handler } from '../lambda/action-handler/index';
import { BedrockAgentEvent, BedrockAgentResponse } from '../lambda/action-handler/types';

describe('Lambda Handler', () => {
  const baseEvent: BedrockAgentEvent = {
    messageVersion: '1.0',
    agent: {
      name: 'BedrockDemoAgent',
      id: 'test-agent-id',
      alias: 'prod',
      version: 'DRAFT'
    },
    sessionId: 'test-session-123',
    sessionAttributes: {},
    actionGroup: 'CustomerServiceActionGroup',
    apiPath: '',
    httpMethod: 'POST'
  };

  function withRequestBody(apiPath: string, fields: Record<string, string>): BedrockAgentEvent {
    return {
      ...baseEvent,
      apiPath,
      requestBody: {
        content: {
          'application/json': {
            properties: Object.entries(fields).map(([name, value]) => ({
              name,
              type: 'string',
              value
            }))
          }
        }
      }
    };
  }

  function bodyOf(response: BedrockAgentResponse): Record<string, string> {
    return JSON.parse(response.response.responseBody['application/json'].body);
  }

  describe('checkOrderStatus', () => {
    test('returns order status for an order ID in the request body', async () => {
      const event = withRequestBody('/checkOrderStatus', { orderId: 'ORD-12345' });

      const response = await handler(event);

      expect(response.messageVersion).toBe('1.0');
      expect(response.response.httpStatusCode).toBe(200);
      expect(response.response.actionGroup).toBe('CustomerServiceActionGroup');
      expect(response.response.apiPath).toBe('/checkOrderStatus');
      expect(response.response.httpMethod).toBe('POST');

      const body = bodyOf(response);
      expect(body.orderId).toBe('ORD-12345');
      expect(body.status).toBe('Shipped');
      expect(body.estimatedDelivery).toBe('2024-01-15');
    });

    test('reads orderId from parameters when the request body is absent', async () => {
      const event: BedrockAgentEvent = {
        ...baseEvent,
        apiPath: '/checkOrderStatus',
        parameters: [
          { name: 'orderId', type: 'string', value: 'ORD-12345' }
        ]
      };

      const response = await handler(event);

      expect(response.response.httpStatusCode).toBe(200);
      expect(bodyOf(response).orderId).toBe('ORD-12345');
    });

    test('returns 400 when orderId is missing', async () => {
      const event: BedrockAgentEvent = {
        ...baseEvent,
        apiPath: '/checkOrderStatus'
      };

      const response = await handler(event);

      expect(response.response.httpStatusCode).toBe(400);
      expect(bodyOf(response).error).toBe('Missing required parameter(s): orderId');
    });
  });

  describe('processReturn', () => {
    test('processes return with order ID and reason in the request body', async () => {
      const event = withRequestBody('/processReturn', {
        orderId: 'ORD-12345',
        reason: 'Defective product'
      });

      const response = await handler(event);

      expect(response.messageVersion).toBe('1.0');
      expect(response.response.httpStatusCode).toBe(200);
      expect(response.response.actionGroup).toBe('CustomerServiceActionGroup');
      expect(response.response.apiPath).toBe('/processReturn');
      expect(response.response.httpMethod).toBe('POST');

      const body = bodyOf(response);
      expect(body.orderId).toBe('ORD-12345');
      expect(body.reason).toBe('Defective product');
      expect(body.status).toBe('Approved');
      expect(body.returnId).toMatch(/^RET-/);
    });

    test('generates unique return ID for each request', async () => {
      const event = withRequestBody('/processReturn', {
        orderId: 'ORD-12345',
        reason: 'Wrong size'
      });

      const response1 = await handler(event);
      await new Promise(resolve => setTimeout(resolve, 10));
      const response2 = await handler(event);

      expect(bodyOf(response1).returnId).not.toBe(bodyOf(response2).returnId);
    });

    test('returns 400 when reason is missing', async () => {
      const event = withRequestBody('/processReturn', { orderId: 'ORD-12345' });

      const response = await handler(event);

      expect(response.response.httpStatusCode).toBe(400);
      expect(bodyOf(response).error).toBe('Missing required parameter(s): reason');
    });
  });

  describe('error handling', () => {
    test('returns 500 error for unknown API path', async () => {
      const event: BedrockAgentEvent = {
        ...baseEvent,
        apiPath: '/unknownEndpoint'
      };

      const response = await handler(event);

      expect(response.messageVersion).toBe('1.0');
      expect(response.response.httpStatusCode).toBe(500);
      expect(response.response.actionGroup).toBe('CustomerServiceActionGroup');
      expect(response.response.apiPath).toBe('/unknownEndpoint');
      expect(bodyOf(response).error).toBe('Unknown API path: /unknownEndpoint');
    });

    test('maintains correct response structure on error', async () => {
      const event: BedrockAgentEvent = {
        ...baseEvent,
        apiPath: '/invalid'
      };

      const response = await handler(event);

      expect(response).toHaveProperty('messageVersion');
      expect(response).toHaveProperty('response');
      expect(response.response).toHaveProperty('actionGroup');
      expect(response.response).toHaveProperty('apiPath');
      expect(response.response).toHaveProperty('httpMethod');
      expect(response.response).toHaveProperty('httpStatusCode');
      expect(response.response).toHaveProperty('responseBody');
      expect(response.response.responseBody).toHaveProperty('application/json');
    });
  });

  describe('response format validation', () => {
    test('response matches Bedrock Agent format', async () => {
      const response: BedrockAgentResponse = await handler(
        withRequestBody('/checkOrderStatus', { orderId: 'ORD-12345' })
      );

      expect(response).toHaveProperty('messageVersion');
      expect(response).toHaveProperty('response');
      expect(response.response).toHaveProperty('actionGroup');
      expect(response.response).toHaveProperty('apiPath');
      expect(response.response).toHaveProperty('httpMethod');
      expect(response.response).toHaveProperty('httpStatusCode');
      expect(response.response).toHaveProperty('responseBody');
      expect(response.response.responseBody).toHaveProperty('application/json');
      expect(response.response.responseBody['application/json']).toHaveProperty('body');

      const body = bodyOf(response);
      expect(typeof body).toBe('object');
    });

    test('response echoes request metadata', async () => {
      const event = withRequestBody('/checkOrderStatus', { orderId: 'ORD-12345' });

      const response = await handler(event);

      expect(response.response.actionGroup).toBe(event.actionGroup);
      expect(response.response.apiPath).toBe(event.apiPath);
      expect(response.response.httpMethod).toBe(event.httpMethod);
    });
  });
});
