module.exports = {
  root: true,
  env: {
    browser: true,
  },
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/standard',
    '@vue/eslint-config-typescript/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  globals: {
    name: 'off',
    defineExpose: false,
  },
  rules: {
    'vue/html-closing-bracket-newline': [
      'error',
      {
        singleline: 'never',
        multiline: 'always',
      },
    ],
    'no-var': ['error'],
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'none',
        },
        singleline: {
          delimiter: 'comma',
        },
      },
    ],
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-use-before-define': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'vue/no-multiple-template-root': 'off',
    indent: 'off',
    '@typescript-eslint/indent': ['error', 2],
    'no-use-before-define': 'off',
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    'vue/multi-word-component-names': 'warn',
    '@typescript-eslint/type-annotation-spacing': ['error'],
    'func-call-spacing': 'off',
    '@typescript-eslint/func-call-spacing': ['error'],
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        'import/first': 'off',
      },
      globals: {
        defineProps: false,
        defineEmits: false,
      },
    },
    {
      files: ['**/cypress/integration/**'],
      extends: [
        'plugin:cypress/recommended',
      ],
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'histoire-dist/',
    'generated/',
    '!.*',
    '.nuxt/',
  ],
}
