module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'prefer-template': 'off',
    'no-unused-vars': 'off',
    'import/no-anonymous-default-export': 'off',
    'react-hooks/exhaustive-deps': 'off',
  },
  ignorePatterns: [
    'build/',
    'node_modules/',
    '**/*debug*',
    '**/debug/**'
  ]
};
