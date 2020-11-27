module.exports = {
    extends: ['eslint:recommended', 'prettier'],
    parser: 'babel-eslint',
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
    },
    plugins: ['prettier', 'jest'],
    rules: {
        'prettier/prettier': [
            'error',
            {
                singleQuote: true,
                trailingComma: 'all',
                tabWidth: 4,
                printWidth: 150,
            },
        ],
        'no-console': 1,
        eqeqeq: ['error', 'always'],
    },
    env: {
        es6: true,
        browser: true,
        node: true,
    },
};
