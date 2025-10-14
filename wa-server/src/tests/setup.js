"use strict";

// Global test setup
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = "test";
  process.env.PORT = "3001";
});

afterAll(() => {
  // Cleanup after all tests
  jest.clearAllMocks();
});

// Increase timeout for all tests
jest.setTimeout(10000);
