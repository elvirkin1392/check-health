export enum Command {
  Start = "start",
  ColdStart = "cold_start",
  ColdEnd = "cold_end",
  HealthyDays = "healthy_days",
  HealthyYear = "healthy_year",
  Lang = "lang",
  TimeZone = "timezone",
  Login = "login",
  // Загрузка файла с анализами (004). Значения короткие: они едут
  // в `callback_data`, а там 64 байта на всё (§11).
  LabConfirm = "lab_ok",
  LabCancel = "lab_no",
  LabDate = "lab_date"
}