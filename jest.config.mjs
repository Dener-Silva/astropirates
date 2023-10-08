/** @type {import('ts-jest').JestConfigWithTsJest} */
import backend from './packages/backend/jest.config.cjs';
import dtos from './packages/dtos/jest.config.js';
import frontend from './packages/frontend/jest.config.js';

export default {
    verbose: true,
    projects: [
      {
        ...backend,
        displayName: 'backend',
        testMatch: ['<rootDir>/packages/backend/test/*'],
      },
      {
        ...dtos,
        displayName: 'dtos',
        testMatch: ['<rootDir>/packages/dtos/test/*'],
      },
      {
        ...frontend,
        displayName: 'frontend',
        testMatch: ['<rootDir>/packages/frontend/test/**/*.test.*'],
        moduleNameMapper: {
          ...frontend.moduleNameMapper,
          '^.+\\.(vert|frag|glsl)$': '<rootDir>/packages/frontend/test/GLSLTransformer.ts',
          '^.+\\.(jpg|jpeg|png|gif|webp|svg|ttf|woff|woff2|wav|mp3)$': '<rootDir>/packages/frontend/test/FilePathTransformer.ts'      
        }
      },
    ],
  };
  