import {en} from "./en";

export const ru: typeof en = {
  start_created: "Приятно познакомиться!\nЯ помогу собирать статистику по вашему здоровью",
  start_failed: "Не получилось создать профиль. \nНапишите 'bug_rescue', чтобы позвать разработчика",
  healthy_days_none: "Вы ещё не отмечали ни одной болезни — так держать!",
  healthy_days: "Вы здоровы уже {{value}} дн.",
  healthy_year: "За последний год вы были здоровы {{value}} дн.",
  login_code: "Код для входа: {{value}}",
  cold_start_question: "Сколько длится простуда?",
  cold_start_first_day: "первый день",
  cold_start_yesterday: "со вчера",
  cold_end_question: "Когда стало лучше?",
  cold_end_today: "сегодня",
  pick_a_date: "выбрать дату",
  choose_a_date: "Выберите дату",
  calendar_updated: "Календарь обновлён",
  ill_period_closed: "Период болезни закрыт. Ура!",
  check_health_question: "Как самочувствие?",
  check_health_good: "хорошо",
  check_health_still_bad: "ещё плохо",
  lang_prompt: "Выберите язык",
  lang_saved: "Язык переключён на русский",
}
