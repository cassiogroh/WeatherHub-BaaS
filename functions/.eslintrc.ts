const eslintConfig = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
    "indent": ["error", 2],
    "linebreak-style": ["error", "windows"],
    "require-jsdoc": "off",
    "object-curly-spacing": ["error", "always"],
    "no-var": "off",
    "max-len": "off",
    "dot-location": ["error", "property"],
    "comma-dangle": ["error", "always-multiline"], // enforce trailing comma
    "eol-last": ["error", "always"], // enforce empty line at the end of files
  },
};

export default eslintConfig;
