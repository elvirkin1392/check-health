/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  transform: {
    "^.test.tsx?$": ["ts-jest",{}],
  },
};
