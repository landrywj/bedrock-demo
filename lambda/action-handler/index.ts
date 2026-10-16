import { BedrockAgentEvent, BedrockAgentResponse, BedrockParameter } from './types';

function parameterValue(parameters: BedrockParameter[] | undefined, name: string): string | undefined {
  const value = parameters?.find((parameter) => parameter.name === name)?.value?.trim();
  return value ? value : undefined;
}

function readParameter(event: BedrockAgentEvent, name: string): string | undefined {
  const fromBody = parameterValue(
    event.requestBody?.content?.['application/json']?.properties,
    name
  );
  if (fromBody) {
    return fromBody;
  }
  return parameterValue(event.parameters, name);
}

function respond(event: BedrockAgentEvent, httpStatusCode: number, body: unknown): BedrockAgentResponse {
  return {
    messageVersion: '1.0',
    response: {
      actionGroup: event.actionGroup,
      apiPath: event.apiPath,
      httpMethod: event.httpMethod,
      httpStatusCode,
      responseBody: {
        'application/json': {
          body: JSON.stringify(body)
        }
      }
    }
  };
}

function requireParameters(event: BedrockAgentEvent, names: string[]): Record<string, string> | BedrockAgentResponse {
  const values: Record<string, string> = {};
  const missing: string[] = [];

  for (const name of names) {
    const value = readParameter(event, name);
    if (value) {
      values[name] = value;
    } else {
      missing.push(name);
    }
  }

  if (missing.length > 0) {
    return respond(event, 400, {
      error: `Missing required parameter(s): ${missing.join(', ')}`
    });
  }

  return values;
}

function isResponse(value: Record<string, string> | BedrockAgentResponse): value is BedrockAgentResponse {
  return 'messageVersion' in value;
}

export const handler = async (event: BedrockAgentEvent): Promise<BedrockAgentResponse> => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const { apiPath } = event;

  try {
    if (apiPath === '/checkOrderStatus') {
      const parameters = requireParameters(event, ['orderId']);
      if (isResponse(parameters)) {
        return parameters;
      }
      return respond(event, 200, {
        orderId: parameters.orderId,
        status: 'Shipped',
        estimatedDelivery: '2024-01-15'
      });
    }

    if (apiPath === '/processReturn') {
      const parameters = requireParameters(event, ['orderId', 'reason']);
      if (isResponse(parameters)) {
        return parameters;
      }
      return respond(event, 200, {
        orderId: parameters.orderId,
        returnId: 'RET-' + Date.now(),
        status: 'Approved',
        reason: parameters.reason
      });
    }

    throw new Error(`Unknown API path: ${apiPath}`);
  } catch (error) {
    console.error('Error processing request:', error);
    return respond(event, 500, { error: (error as Error).message });
  }
};
