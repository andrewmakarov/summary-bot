module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest", // Allows the use of modern ECMAScript features
        sourceType: "module", // Allows for the use of imports
        project: './tsconfig.json'
    },
    extends: [
        'airbnb-base',
        'airbnb-typescript/base',
    ],
    env: {
        node: true, // Enable Node.js global variables
    },
    rules: {
        //"indent": "off",
        "@typescript-eslint/indent": ["error", 4],
        "class-methods-use-this": ["off"],
        'max-len': 'off',
        "import/prefer-default-export": 'off',
    },
    // rules: {
    //     '@typescript-eslint/no-extra-semi': 'error',
    //     '@typescript-eslint/semi': 'error',
    // }
};