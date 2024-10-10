export default function getCalendar() {
  const date = new Date();

  function daysInMonth(month: number, year: number) {
    return new Date(year, month, 0).getDate();
  }

  const currentMonthLength = daysInMonth(date.getMonth(), date.getFullYear())
  const prevMonthLength = daysInMonth(date.getMonth() - 1, date.getFullYear())

  let calendarLength = 30;
  let arr = new Array(calendarLength);
  arr[calendarLength / 2] = date.getDate();

  for (let i = calendarLength / 2 - 1; i > 0; i--) {
    if (arr[i + 1] > 1) {
      arr[i] = arr[i + 1] - 1;
    } else {
      arr[i] = prevMonthLength;
    }
  }

  for (let i = calendarLength / 2 + 1; i < arr.length; i++) {
    if (arr[i - 1] < currentMonthLength) {
      arr[i] = arr[i - 1] + 1;
    } else {
      arr[i] = 1;
    }
  }
  return arr;
}