import {DatePeriod} from "./utils";

export type Bio = {
  first_name: string;
  second_name: string;
  username: string;
};

export type UserData = {
  bio: Bio;
  ill_periods: DatePeriod[];
};
