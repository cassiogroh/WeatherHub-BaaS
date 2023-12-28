module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh"],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
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
    "@typescript-eslint/no-explicit-any": "off",
    "no-trailing-spaces": "error",
  },
}
