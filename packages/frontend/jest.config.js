/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^.+\\.(vert|frag|glsl)$': '<rootDir>/test/GLSLTransformer.ts',
    '^.+\\.(jpg|jpeg|png|gif|webp|svg|ttf|woff|woff2|wav|mp3)$': '<rootDir>/test/FilePathTransformer.ts'
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  setupFiles: ["jest-webgl-canvas-mock"]
};