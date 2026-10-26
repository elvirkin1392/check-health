# check-health

Трекер болезней: Telegram-бот + Mini App. Сервер — Express + MongoDB, клиент — React + Vite.
Подробности в README.md.

## Раскладка

npm workspaces, один `package-lock.json` в корне:

```
server/   Express API, Telegram-бот, cron-задачи
client/   React Mini App (Vite)
shared/   то немногое, о чём договариваются обе половины (пока — поддерживаемые языки)
specs/    спецификации, по папке на фичу
```

`shared/` — не workspace, а обычная папка с исходниками: её импортируют по относительному пути.

## Команды

Установка один раз из корня — она поднимает оба workspace:

```
npm install
```

Из корня, сразу по обоим workspace:

- `npm run check-ts`, `npm test`, `npm run lint`, `npm run build`
- `npm run dev:server`, `npm run dev:client`

Внутри одного workspace: `npm test --workspace @check-health/server` (или `--workspace @check-health/client`).

Переменные окружения сервера — в `server/.env` (шаблон рядом: `server/.env.template`).

Тесты — Jest, файлы `*.test.tsx` рядом с модулем. У клиента тестов пока нет.

## Деплой

- Сервер → Cloud Run: `Dockerfile` в корне, собирается `server/` вместе с `shared/`.
  `.gcloudignore` держит клиент и документацию вне загрузки.
- Клиент → GitHub Pages: `vite build`.
- Оба — через GitHub Actions на push в `master`.

## Spec-Driven Development

Новые фичи и изменения поведения делаются через спецификации в `specs/`.
Принципы проекта — `specs/constitution.md`.
Отложенное: ручные проверки и известные проблемы с данными — `specs/deferred.md`.

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
- Задание субагенту пишется абсолютными путями от корня репозитория. Субагент наследует
  рабочий каталог сессии, а он может оказаться копией репозитория (`.claude/worktrees/`) —
  тогда относительные пути уведут его туда и работа потеряется.
