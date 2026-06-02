export default [
  {
    ignores: [
      "dist/",
      "node_modules/",
      "public/",
      "coverage/",
      "vite.config.ts",
      "vitest.config.ts",
      "src/**/*.ts",
      "src/**/*.tsx",
      "server.ts"
    ]
  },
  {
    files: ["src/**/*.js"],
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "semi": ["error", "always"]
    }
  }
];
