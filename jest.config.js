const {defaults} = require('jest-config')
module.exports = {
  moduleFileExtensions: ['ts', ...defaults.moduleFileExtensions],
  coveragePathIgnorePatterns: [
    ...defaults.coveragePathIgnorePatterns,
    'test-driver',
    'src/request/index.ts',
    'src/server/index.ts'
  ],
  coverageReporters: ['text', 'json']
}