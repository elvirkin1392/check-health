# Задачи: <название фичи>

План: [plan.md](./plan.md)

`[P]` — можно выполнять параллельно с другими `[P]` задачами той же фазы (разные файлы).

## Фаза 1 — Тесты (`/sdd-tests`)

- [ ] T001 Тест для AC-1: <что проверяет> — `path/to/module.test.tsx`
- [ ] T002 [P] Тест для AC-2: …

## Фаза 2 — Реализация (`/sdd-implement`)

- [ ] T010 <задача> (FR-1) — `path/to/file.tsx`
- [ ] T011 [P] <задача> (FR-2) — …

## Фаза 3 — Проверка

- [ ] T090 `npm run check-ts` и `npm test` зелёные
- [ ] T091 `cd client && npm run lint && npm run check-ts && npm test` (если менялся client/)
- [ ] T092 Ручная проверка: <шаги в боте / Mini App>
