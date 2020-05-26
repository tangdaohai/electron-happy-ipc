const {defaults} = require('jest-config')
module.exports = {
  coveragePathIgnorePatterns: [
    ...defaults.coveragePathIgnorePatterns,
    'test-driver',
    'src/request/index.ts',
    'src/server/index.ts'
  ],
  coverageReporters: ['text', 'json']
}