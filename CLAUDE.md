# check-health

Трекер болезней: Telegram-бот + Mini App. Сервер — Express + MongoDB (корень репозитория),
клиент — React + Vite (`client/`). Подробности в README.md.

## Команды

- Сервер: `npm run dev`, `npm run check-ts`, `npm test`
- Клиент (`cd client`): `npm run dev`, `npm run lint`, `npm run check-ts`, `npm test`
- Тесты — Jest, файлы `*.test.tsx` рядом с модулем.

## Spec-Driven Development

Новые фичи и изменения поведения делаются через спецификации в `specs/`.
Принципы проекта — `specs/constitution.md`.

Порядок:
1. `/sdd-specify <описание>` → `specs/NNN-slug/spec.md` — ЧТО и ЗАЧЕМ. Пользователь читает и отвечает на вопросы.
2. `/sdd-plan` → `plan.md` + `tasks.md` — КАК.
3. `/sdd-tests` → тесты из критериев приёмки; пользователь их просматривает.
4. `/sdd-implement` → блокирует тесты (`.claude/tests.lock`) и реализует задачи через субагента `implementer`.
5. `/sdd-review` → субагент `spec-reviewer` сверяет код со спекой в свежем контексте.

Правила:
- Не писать код фичи, пока spec.md и plan.md не согласованы с пользователем.
- Если поведение меняется — сначала обновить spec.md.
- Пока существует `.claude/tests.lock`, тестовые файлы не менять и lock не удалять: это делает только пользователь.
- Багфиксы и мелкие правки (без изменения поведения) можно делать без спеки.
