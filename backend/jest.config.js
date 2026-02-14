

module.exports = {
  // Test environment
  testEnvironment: "node",


  // Enable code coverage collection & reports
  collectCoverage: true,
  collectCoverageFrom: [
    "controllers/**/*.js",
    "models/**/*.js",
    "middleware/**/*.js",
    "routes/**/*.js",
    "!**/node_modules/**",
    "!**/tests/**",
  ],
  
  // Coverage directory 
  coverageDirectory: "coverage",
  
  // Coverage report formats
  coverageReporters: [
    "text",           
    "text-summary",   
    "html",           
    "lcov",           
    "json",           
  ],
  
  coveragePathIgnorePatterns: ["/node_modules/", "/uploads/"],
  
  // Coverage thresholds for CI/CD gating 
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },

  
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  testPathIgnorePatterns: ["/node_modules/", "/coverage/"],


  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

  
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  
  // Verbose output for detailed test execution logs
  verbose: true,
  
  // Reporter configuration - generates test-report.html
  reporters: [
    "default",
    [
      "jest-html-reporter",
      {
        pageTitle: "Team 3 Test Report ",
        outputPath: "../test-report.html",
        includeFailureMsg: true,
        includeConsoleLog: true,
        dateFormat: "yyyy-mm-dd HH:MM:ss",
        statusIgnoreFilter: "pending",
      },
    ],
  ],


  testTimeout: 10000,
};
