import * as fs from 'fs';
import * as path from 'path';

describe('Action Group Schema', () => {
  const schemaPath = path.join(__dirname, '../schemas/action-group-schema.json');
  let schema: any;

  beforeAll(() => {
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    schema = JSON.parse(schemaContent);
  });

  test('schema file exists and is valid JSON', () => {
    expect(fs.existsSync(schemaPath)).toBe(true);
    expect(schema).toBeDefined();
    expect(typeof schema).toBe('object');
  });

  test('schema is OpenAPI 3.0 format', () => {
    expect(schema.openapi).toBe('3.0.0');
    expect(schema.info).toBeDefined();
    expect(schema.paths).toBeDefined();
  });

  test('schema has required info fields', () => {
    expect(schema.info).toHaveProperty('title');
    expect(schema.info).toHaveProperty('version');
    expect(schema.info).toHaveProperty('description');
    expect(typeof schema.info.title).toBe('string');
    expect(typeof schema.info.version).toBe('string');
    expect(typeof schema.info.description).toBe('string');
  });

  test('schema defines checkOrderStatus endpoint', () => {
    expect(schema.paths).toHaveProperty('/checkOrderStatus');
    expect(schema.paths['/checkOrderStatus']).toHaveProperty('post');
    
    const endpoint = schema.paths['/checkOrderStatus'].post;
    expect(endpoint).toHaveProperty('operationId', 'checkOrderStatus');
    expect(endpoint).toHaveProperty('summary');
    expect(endpoint).toHaveProperty('description');
    expect(endpoint).toHaveProperty('requestBody');
    expect(endpoint).toHaveProperty('responses');
  });

  test('checkOrderStatus has correct request schema', () => {
    const endpoint = schema.paths['/checkOrderStatus'].post;
    const requestSchema = endpoint.requestBody.content['application/json'].schema;
    
    expect(requestSchema.type).toBe('object');
    expect(requestSchema.properties).toHaveProperty('orderId');
    expect(requestSchema.properties.orderId.type).toBe('string');
    expect(requestSchema.required).toContain('orderId');
  });

  test('checkOrderStatus has correct response schema', () => {
    const endpoint = schema.paths['/checkOrderStatus'].post;
    const responseSchema = endpoint.responses['200'].content['application/json'].schema;
    
    expect(responseSchema.type).toBe('object');
    expect(responseSchema.properties).toHaveProperty('orderId');
    expect(responseSchema.properties).toHaveProperty('status');
    expect(responseSchema.properties).toHaveProperty('estimatedDelivery');
  });

  test('schema defines processReturn endpoint', () => {
    expect(schema.paths).toHaveProperty('/processReturn');
    expect(schema.paths['/processReturn']).toHaveProperty('post');
    
    const endpoint = schema.paths['/processReturn'].post;
    expect(endpoint).toHaveProperty('operationId', 'processReturn');
    expect(endpoint).toHaveProperty('summary');
    expect(endpoint).toHaveProperty('description');
    expect(endpoint).toHaveProperty('requestBody');
    expect(endpoint).toHaveProperty('responses');
  });

  test('processReturn has correct request schema', () => {
    const endpoint = schema.paths['/processReturn'].post;
    const requestSchema = endpoint.requestBody.content['application/json'].schema;
    
    expect(requestSchema.type).toBe('object');
    expect(requestSchema.properties).toHaveProperty('orderId');
    expect(requestSchema.properties).toHaveProperty('reason');
    expect(requestSchema.properties.orderId.type).toBe('string');
    expect(requestSchema.properties.reason.type).toBe('string');
    expect(requestSchema.required).toContain('orderId');
    expect(requestSchema.required).toContain('reason');
  });

  test('processReturn has correct response schema', () => {
    const endpoint = schema.paths['/processReturn'].post;
    const responseSchema = endpoint.responses['200'].content['application/json'].schema;
    
    expect(responseSchema.type).toBe('object');
    expect(responseSchema.properties).toHaveProperty('orderId');
    expect(responseSchema.properties).toHaveProperty('returnId');
    expect(responseSchema.properties).toHaveProperty('status');
    expect(responseSchema.properties).toHaveProperty('reason');
  });

  test('all endpoints use POST method', () => {
    Object.values(schema.paths).forEach((pathObj: any) => {
      expect(pathObj).toHaveProperty('post');
      expect(pathObj.post).toHaveProperty('operationId');
    });
  });

  test('all endpoints have 200 response defined', () => {
    Object.values(schema.paths).forEach((pathObj: any) => {
      const endpoint = pathObj.post;
      expect(endpoint.responses).toHaveProperty('200');
      expect(endpoint.responses['200']).toHaveProperty('description');
      expect(endpoint.responses['200']).toHaveProperty('content');
    });
  });
});

