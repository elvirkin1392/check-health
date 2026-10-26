/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  // `shared/` не workspace, и своего прогона у неё нет. Её потребители — сервер
  // и клиент; тесты общего кода держим здесь, в давно существующем наборе.
  roots: ["<rootDir>", "<rootDir>/../shared"],
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
};
