module.exports = {
  projects: [
    // Pure TypeScript tests (utils, db, stores) — no React Native
    {
      displayName: 'unit',
      testMatch: [
        '<rootDir>/src/utils/**/*.test.ts',
        '<rootDir>/src/db/**/*.test.ts',
        '<rootDir>/src/stores/**/*.test.ts',
      ],
      transform: {
        '^.+\\.tsx?$': [
          'babel-jest',
          { configFile: './babel.config.js' },
        ],
      },
      transformIgnorePatterns: [
        'node_modules/(?!(uuid|expo-sqlite|expo-crypto)/)',
      ],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    },
    // Component/screen tests — need React Native
    {
      displayName: 'components',
      preset: 'jest-expo',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.components.js'],
      testMatch: [
        '<rootDir>/src/components/**/*.test.tsx',
        '<rootDir>/src/screens/**/*.test.tsx',
      ],
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|uuid)',
      ],
    },
  ],
};
