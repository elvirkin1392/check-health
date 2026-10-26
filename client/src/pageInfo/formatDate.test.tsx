import {formatAnalyteDate} from './formatDate.tsx';

describe('дата в таблице анализов', () => {
  const october = new Date(2026, 9, 21);

  test('AC-14: с русским языком месяц написан по-русски', () => {
    const formatted = formatAnalyteDate(october, 'ru');

    expect(formatted).toContain('21');
    expect(formatted).toContain('2026');
    expect(formatted).toMatch(/окт/i);
  });

  test('AC-14: с английским языком месяц написан по-английски', () => {
    const formatted = formatAnalyteDate(october, 'en');

    expect(formatted).toContain('21');
    expect(formatted).toContain('2026');
    expect(formatted).toMatch(/oct/i);
  });

  test('AC-14: язык действительно меняет результат', () => {
    expect(formatAnalyteDate(october, 'ru')).not.toBe(formatAnalyteDate(october, 'en'));
  });
});
