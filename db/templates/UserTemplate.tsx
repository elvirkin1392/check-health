import {User} from "../../telegramBot/telegram.types.tsx";

export type IllPeriod = {start_date: string, end_date?: string | null};

export type UserDoc = {
  bio: User,
  blood_tests: unknown[],
  ill_periods: IllPeriod[],
  woman_days: unknown[],
  loginCode: string,
  lang?: string,
};

export const UserTemplate = {
  bio: {},
  blood_tests: [],
  ill_periods: [],
  woman_days: [],
  loginCode: '',
  lang: ''
}
