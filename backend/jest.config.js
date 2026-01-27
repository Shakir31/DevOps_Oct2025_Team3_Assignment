module.exports = {
  //test environment
  testEnvironment: "node",

  //coverage directory
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["/node_modules/", "/uploads/"],

  //test match patterns
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],

  //setup files
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

  //clear mocks between tests
  clearMocks: true,
  verbose: true,
};
