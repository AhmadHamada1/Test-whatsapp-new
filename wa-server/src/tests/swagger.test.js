"use strict";

const request = require("supertest");
const { appFactory } = require("./setup");

describe("Swagger Documentation", () => {
  let app;

  beforeAll(() => {
    app = appFactory();
  });

  test("GET /api-docs should serve Swagger UI", async () => {
    const response = await request(app)
      .get("/api-docs")
      .expect(200);

    expect(response.text).toContain("swagger-ui");
  });

  test("GET /api-docs-json should return OpenAPI spec", async () => {
    const response = await request(app)
      .get("/api-docs-json")
      .expect(200);

    expect(response.body).toHaveProperty("openapi", "3.0.0");
    expect(response.body).toHaveProperty("info");
    expect(response.body).toHaveProperty("paths");
    expect(response.body).toHaveProperty("components");
  });

  test("OpenAPI spec should contain WhatsApp endpoints", async () => {
    const response = await request(app)
      .get("/api-docs-json")
      .expect(200);

    const spec = response.body;
    
    // Check for WhatsApp endpoints
    expect(spec.paths).toHaveProperty("/wa/add-number");
    expect(spec.paths).toHaveProperty("/wa/send");
    expect(spec.paths).toHaveProperty("/wa/status");
    expect(spec.paths).toHaveProperty("/wa/connections");
    expect(spec.paths).toHaveProperty("/wa/disconnect/{connectionId}");
    
    // Check for health endpoint
    expect(spec.paths).toHaveProperty("/healthz");
  });

  test("OpenAPI spec should contain required schemas", async () => {
    const response = await request(app)
      .get("/api-docs-json")
      .expect(200);

    const spec = response.body;
    
    // Check for required schemas
    expect(spec.components.schemas).toHaveProperty("Error");
    expect(spec.components.schemas).toHaveProperty("Success");
    expect(spec.components.schemas).toHaveProperty("Connection");
    expect(spec.components.schemas).toHaveProperty("QRCode");
    expect(spec.components.schemas).toHaveProperty("Message");
    expect(spec.components.schemas).toHaveProperty("MessageResponse");
  });

  test("OpenAPI spec should have security schemes", async () => {
    const response = await request(app)
      .get("/api-docs-json")
      .expect(200);

    const spec = response.body;
    
    expect(spec.components.securitySchemes).toHaveProperty("apiKeyAuth");
    expect(spec.components.securitySchemes.apiKeyAuth).toHaveProperty("type", "apiKey");
    expect(spec.components.securitySchemes.apiKeyAuth).toHaveProperty("in", "header");
    expect(spec.components.securitySchemes.apiKeyAuth).toHaveProperty("name", "x-api-key");
  });
});
