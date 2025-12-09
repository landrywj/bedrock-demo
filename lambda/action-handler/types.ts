export interface BedrockAgentEvent {
  messageVersion: string;
  agent: {
    name: string;
    id: string;
    alias: string;
    version: string;
  };
  sessionId: string;
  sessionAttributes: Record<string, string>;
  actionGroup: string;
  apiPath: string;
  httpMethod: string;
  parameters: Array<{
    name: string;
    type: string;
    value: string;
  }>;
}

export interface BedrockAgentResponse {
  messageVersion: string;
  response: {
    actionGroup: string;
    apiPath: string;
    httpMethod: string;
    httpStatusCode: number;
    responseBody: {
      'application/json': {
        body: string;
      };
    };
  };
}
