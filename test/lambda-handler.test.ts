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
    httpMethod: 'POST',
    parameters: []
  };

  describe('checkOrderStatus', () => {
    test('returns order status for valid order ID', async () => {
      const event: BedrockAgentEvent = {
        ...baseEvent,
        apiPath: '/checkOrderStatus',
        parameters: [
          { name: 'orderId', type: 'string', value: 'ORD-12345' }
        ]
      };

      const response = await handler(event);

      expect(response.messageVersion).toBe('1.0');
      expect(response.response.httpStatusCode).toBe(200);
      expect(response.response.actionGroup).toBe('CustomerServiceActionGroup');
      expect(response.response.apiPath).toBe('/checkOrderStatus');
      expect(response.response.httpMethod).toBe('POST');

      const body = JSON.parse(response.response.responseBody['application/json'].body);
      expect(body.orderId).toBe('ORD-12345');
      expect(body.status).toBe('Shipped');
      expect(body.estimatedDelivery).toBe('2024-01-15');
    });

    test('handles missing orderId parameter gracefully', async () => {
      const event: BedrockAgentEvent = {
        ...baseEvent,
        apiPath: '/checkOrderStatus',
        parameters: []
      };

      const response = await handler(event);

      expect(response.messageVersion).toBe('1.0');
      expect(response.response.httpStatusCode).toBe(200);
      
      const body = JSON.parse(response.response.responseBody['application/json'].body);
      // When orderId is missing, it will be undefined in the result object
      // but JSON.stringify removes undefined properties, so orderId won't be in the parsed body
      // The important thing is that the response structure is valid and other fields exist
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('estimatedDelivery');
      // orderId may or may not be present after JSON serialization (undefined values are removed)
      // This is acceptable behavior
    });
  });

  describe('processReturn', () => {
    test('processes return with valid order ID and reason', async () => {
      const event: BedrockAgentEvent = {
        ...baseEvent,
        apiPath: '/processReturn',
        parameters: [
          { name: 'orderId', type: 'string', value: 'ORD-12345' },
          { name: 'reason', type: 'string', value: 'Defective product' }
        ]
      };

      const response = await handler(event);

      expect(response.messageVersion).toBe('1.0');
      expect(response.response.httpStatusCode).toBe(200);
      expect(response.response.actionGroup).toBe('CustomerServiceActionGroup');
      expect(response.response.apiPath).toBe('/processReturn');
      expect(response.response.httpMethod).toBe('POST');

      const body = JSON.parse(response.response.responseBody['application/json'].body);
      expect(body.orderId).toBe('ORD-12345');
      expect(body.reason).toBe('Defective product');
      expect(body.status).toBe('Approved');
      expect(body.returnId).toMatch(/^RET-/);
    });

    test('generates unique return ID for each request', async () => {
      const event: BedrockAgentEvent = {
        ...baseEvent,
        apiPath: '/processReturn',
        parameters: [
          { name: 'orderId', type: 'string', value: 'ORD-12345' },
          { name: 'reason', type: 'string', value: 'Wrong size' }
        ]
      };

      const response1 = await handler(event);
      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
      const response2 = await handler(event);

      const body1 = JSON.parse(response1.response.responseBody['application/json'].body);
      const body2 = JSON.parse(response2.response.responseBody['application/json'].body);

      expect(body1.returnId).not.toBe(body2.returnId);
    });

    test('handles missing parameters gracefully', async () => {
      const event: BedrockAgentEvent = {
        ...baseEvent,
        apiPath: '/processReturn',
        parameters: [
          { name: 'orderId', type: 'string', value: 'ORD-12345' }
        ]
      };

      const response = await handler(event);

      expect(response.response.httpStatusCode).toBe(200);
      const body = JSON.parse(response.response.responseBody['application/json'].body);
      expect(body).toHaveProperty('orderId');
      expect(body).toHaveProperty('returnId');
      expect(body).toHaveProperty('status');
    });
  });

  describe('error handling', () => {
    test('returns 500 error for unknown API path', async () => {
      const event: BedrockAgentEvent = {
        ...baseEvent,
        apiPath: '/unknownEndpoint',
        parameters: []
      };

      const response = await handler(event);

      expect(response.messageVersion).toBe('1.0');
      expect(response.response.httpStatusCode).toBe(500);
      expect(response.response.actionGroup).toBe('CustomerServiceActionGroup');
      expect(response.response.apiPath).toBe('/unknownEndpoint');

      const body = JSON.parse(response.response.responseBody['application/json'].body);
      expect(body.error).toBe('Unknown API path: /unknownEndpoint');
    });

    test('maintains correct response structure on error', async () => {
      const event: BedrockAgentEvent = {
        ...baseEvent,
        apiPath: '/invalid',
        parameters: []
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
      const event: BedrockAgentEvent = {
        ...baseEvent,
        apiPath: '/checkOrderStatus',
        parameters: [
          { name: 'orderId', type: 'string', value: 'ORD-12345' }
        ]
      };

      const response: BedrockAgentResponse = await handler(event);

      // Validate top-level structure
      expect(response).toHaveProperty('messageVersion');
      expect(response).toHaveProperty('response');

      // Validate response object
      expect(response.response).toHaveProperty('actionGroup');
      expect(response.response).toHaveProperty('apiPath');
      expect(response.response).toHaveProperty('httpMethod');
      expect(response.response).toHaveProperty('httpStatusCode');
      expect(response.response).toHaveProperty('responseBody');

      // Validate responseBody structure
      expect(response.response.responseBody).toHaveProperty('application/json');
      expect(response.response.responseBody['application/json']).toHaveProperty('body');

      // Validate body is valid JSON string
      const body = JSON.parse(response.response.responseBody['application/json'].body);
      expect(typeof body).toBe('object');
    });

    test('response echoes request metadata', async () => {
      const event: BedrockAgentEvent = {
        ...baseEvent,
        apiPath: '/checkOrderStatus',
        httpMethod: 'POST',
        actionGroup: 'CustomerServiceActionGroup',
        parameters: [
          { name: 'orderId', type: 'string', value: 'ORD-12345' }
        ]
      };

      const response = await handler(event);

      expect(response.response.actionGroup).toBe(event.actionGroup);
      expect(response.response.apiPath).toBe(event.apiPath);
      expect(response.response.httpMethod).toBe(event.httpMethod);
    });
  });
});

