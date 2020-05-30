const {defaults} = require('jest-config')
module.exports = {
  moduleFileExtensions: ['ts', ...defaults.moduleFileExtensions],
  coveragePathIgnorePatterns: [
    ...defaults.coveragePathIgnorePatterns,
    'test-driver',
    'request/index.ts',
    'server/index.ts'
  ],
  coverageReporters: ['text', 'json']
}