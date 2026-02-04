// eslint.config.js (ESLint v9+ with Jest support)
const js = require("@eslint/js");

module.exports = [
    // Configuration for all JS files
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "commonjs", // Change to 'module' if using import/export
            globals: {
                // Node.js globals
                console: "readonly",
                process: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
                Buffer: "readonly",
                module: "readonly",
                require: "readonly",
                exports: "writable",
                global: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly",
            },
        },
        rules: {
            ...js.configs.recommended.rules,
            "no-console": "warn",
            "no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_|req|res|next",
                    varsIgnorePattern: "^_",
                },
            ],
            "consistent-return": "off",
            "no-process-exit": "warn",
            eqeqeq: ["error", "always"],
            curly: ["error", "all"],
            indent: ["error", 4],
            quotes: ["error", "double"],
            semi: ["error", "always"],
            "comma-dangle": ["error", "always-multiline"],
            "no-trailing-spaces": "error",
            "no-multiple-empty-lines": ["error", { max: 1 }],
            "space-before-function-paren": [
                "error",
                {
                    anonymous: "always",
                    named: "never",
                    asyncArrow: "always",
                },
            ],
            "keyword-spacing": "error",
            "space-infix-ops": "error",
            "arrow-spacing": "error",
            "object-curly-spacing": ["error", "always"],
            "array-bracket-spacing": ["error", "never"],
            "no-var": "error",
            "prefer-const": "error",
            "prefer-arrow-callback": "error",
        },
    },

    // Configuration specifically for test files
    {
        files: [
            "**/*.test.js",
            "**/*.spec.js",
            "**/__tests__/**/*.js",
            "**/tests/**/*.js",
        ],
        languageOptions: {
            globals: {
                // Jest globals
                jest: "readonly",
                describe: "readonly",
                test: "readonly",
                it: "readonly",
                expect: "readonly",
                beforeAll: "readonly",
                afterAll: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
                // Node.js globals
                console: "readonly",
                process: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
                Buffer: "readonly",
                module: "readonly",
                require: "readonly",
                exports: "writable",
                global: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly",
            },
        },
    },

    // Ignore patterns
    {
        ignores: [
            "node_modules/**",
            "dist/**",
            "build/**",
            "coverage/**",
            "*.min.js",
            "logs/**",
            "tmp/**",
            "temp/**",
        ],
    },
];
