/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  // Приложение браузерное: рендер-тестам нужны DOM и localStorage.
  testEnvironment: "jsdom",
  transform: {
    // Было "^.test.tsx?$" — такой шаблон не матчил почти ничего, TypeScript
    // не преобразовывался, и ни один тест здесь никогда не запускался:
    // `--passWithNoTests` выдавал это за успех.
    "^.+\\.tsx?$": ["ts-jest", {
      // Корневой tsconfig клиента — только ссылки, без настроек: без этого
      // ts-jest не знает про JSX.
      tsconfig: "tsconfig.app.json",
    }],
  },
};
