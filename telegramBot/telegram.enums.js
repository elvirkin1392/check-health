export const commandsEnum = {
  login: {
    commandKey: "login",
    description: "send request to telegram for authorization",
  },
  cold_start: { commandKey: "cold_start", description: "" },
  cold_end: { commandKey: "cold_end", description: "" },
  healthy_days: { commandKey: "healthy_days", description: "" },
  healthy_year: { commandKey: "healthy_year", description: "" },
  lang: { commandKey: "lang", description: "change language" },
};


export const messageType = {
  calendar: {
    typeKey: 'calendar'
  },
  check_health: {
    typeKey: 'check_health'
  }
}
