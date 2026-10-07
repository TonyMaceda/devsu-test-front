const { createCjsPreset } = require('jest-preset-angular/presets');

module.exports = {
  ...createCjsPreset(),
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: [
    '<rootDir>/src/app/services/**/*.spec.ts',
    '<rootDir>/src/app/features/**/*.spec.ts',
  ],
};
