module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true,
    "commonjs": true,
    "mocha": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module",
    "impliedStrict": true,
  },
  "plugins": [
  ],
  "rules": {
    "no-var": "warn",
    "comma-dangle": ["warn", "always-multiline"],
    "semi": "warn",
    "quotes": ["warn", "double"],
    "eqeqeq": "warn",
    "curly": "error",
    "dot-notation": "warn",
    "no-eval": "error",
    "no-console": "off",
    "brace-style": ["warn", "1tbs"],
    "prefer-const": ["warn", { "destructuring": "any"}],
    "array-bracket-spacing": ["error", "never"],
    "indent": ["warn", 2, { "SwitchCase": 1 }],
    "jsx-quotes": ["warn", "prefer-double"],
    "max-len": ["warn", 80, 2],
    "no-lonely-if": "warn",
  },
  "globals": {
    "expect": true,
    "assert": true,
    "sinon": true
  }
};
