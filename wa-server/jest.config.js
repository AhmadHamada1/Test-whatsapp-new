module.exports = {
  testEnvironment: "node",
  testMatch: ["**/src/tests/**/*.test.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/tests/**",
    "!src/index.js",
    "!node_modules/**"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.js"],
  testTimeout: 10000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
