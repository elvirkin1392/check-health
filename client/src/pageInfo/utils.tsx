const getDiffDays = (start: Date, end:Date): number => {
  const diffTime = Math.abs(start.getTime() - end.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

type DatePeriod = {
  start_date: Date;
  end_date: Date;
};

export const countSummaryFromDayPeriodsLastYear = (periodsArr: Array<DatePeriod>): number => {
  if (!periodsArr) return 0;
  const startPeriod = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
  let countDays = 0;

  for (let i = periodsArr.length - 1; i >= 0; i--) {
    const startDate = new Date(periodsArr[i].start_date);
    const endDate = new Date(periodsArr[i].end_date);

    if (startDate > startPeriod) {

      countDays = countDays + getDiffDays(startDate, endDate);

    } else if (endDate > startPeriod) {

      countDays = countDays + getDiffDays(endDate, startPeriod);

    } else {
      return countDays;
    }
  }
  return countDays
}

export const countDaysFromLastPeriodTilNow = (periodsArr: Array<DatePeriod>): number => {
  if (periodsArr.length === 0) return 0;

  const endDate = new Date(periodsArr[periodsArr.length - 1].end_date);
  return getDiffDays(new Date(), endDate);
}

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

export function getCalendar(calendarLength : number): any[] {
  const date = new Date();
  const datesArr = new Array(calendarLength);
  const currentMonthLength = getDaysInMonth(date.getMonth(), date.getFullYear());
  const prevMonthLength = getDaysInMonth(date.getMonth() - 1, date.getFullYear());
  const middle = calendarLength / 2;
  const beforeMiddle = middle - 1;
  const afterMiddle = middle + 1;

  datesArr[middle] = date.getDate();

  //fill array with previous days
  for (let i = beforeMiddle; i > 0; i--) {
    if (datesArr[i + 1] > 1) {
      datesArr[i] = datesArr[i + 1] - 1;
    } else {
      datesArr[i] = prevMonthLength;
    }
  }

  //fill array with next days
  for (let i = afterMiddle; i < datesArr.length; i++) {
    if (datesArr[i - 1] < currentMonthLength) {
      datesArr[i] = datesArr[i - 1] + 1;
    } else {
      datesArr[i] = 1;
    }
  }

  return datesArr;
}