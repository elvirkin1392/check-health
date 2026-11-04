import {DatePeriod} from "./utils";
import {AnalyteResult} from "../../../shared/analytes.tsx";

export type Bio = {
  first_name: string;
  second_name: string;
  username: string;
};

export type UserData = {
  bio: Bio;
  ill_periods: DatePeriod[];
  // Документы, записанные до появления анализов, поля не имеют (§8).
  blood_tests?: AnalyteResult[];
  lang?: string;
};
