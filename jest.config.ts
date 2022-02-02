import type {Config} from '@jest/types';

const config: Config.InitialOptions = {
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['**/test/**/*.[jt]s?(x)'],
  testPathIgnorePatterns: ['dist/', 'build/'],
  testEnvironment: 'node',
};

export default config;
