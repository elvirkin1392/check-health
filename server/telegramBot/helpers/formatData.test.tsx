import {calcPeriodBetweenDates, extractPeriodsFromYear} from './formatData';
import {DateTime as dt} from "luxon";

const periods = [
  {
    start_date: dt.now().minus({year: 1, days: 2}),
    end_date: dt.now().minus({year: 1}).plus({days: 2})
  },
  {
    start_date: dt.now().minus({days: 7}),
    end_date: dt.now().minus({days: 5})
  },
  {
    start_date: dt.now().minus({days: 3}),
    end_date: null
  }
];
describe('format helpers', () => {
  test('extract periods from last 365 days', () => {
    expect(extractPeriodsFromYear(periods)).toBe(358)
  })

  test('calc diff between dates', () => {
    expect(calcPeriodBetweenDates(periods[0].start_date, periods[0].end_date)).toStrictEqual({days: 4})
  })
})

