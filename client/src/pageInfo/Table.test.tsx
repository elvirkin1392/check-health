// AC-5 со стороны клиента: подтверждённые показатели видны в таблице.
// До 004 таблица работала на `mock.tsx`, и статистика была выдуманной.

import {render, screen, cleanup} from '@testing-library/react';

import Table from './Table.tsx';
import {storeLang} from '../i18n/currentLang';
import {AnalyteResult} from '../../../shared/analytes.tsx';

const result = (over: Partial<AnalyteResult> = {}): AnalyteResult => ({
  code: 'bilirubin',
  name: 'Билирубин общий',
  value: '8.04',
  unit: 'мкмоль/л',
  normal: {from: 5, to: 21},
  date: '2026-10-21',
  ...over,
});

describe('AC-5: таблица показывает данные человека', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  test('значение из профиля видно в таблице', () => {
    render(<Table results={[result({value: '13.7'})]}/>);

    expect(screen.getByText('13.7')).toBeTruthy();
  });

  test('данных из `mock.tsx` в таблице нет', () => {
    // Иначе человек видит чужие выдуманные показатели рядом со своими.
    render(<Table results={[result({value: '13.7'})]}/>);

    expect(screen.queryByText('21.1')).toBeNull();
    expect(screen.queryByText('9.04')).toBeNull();
  });

  test('пустая история — таблица без строк, а не с примером', () => {
    render(<Table results={[]}/>);

    expect(screen.queryByText('8.04')).toBeNull();
  });

  test('узнанный показатель подписан на языке интерфейса', () => {
    storeLang('ru');

    render(<Table results={[result()]}/>);

    // Подпись называет показатель целиком: «Билирубин» рядом с «Билирубин
    // прямой» не говорит, какой это (спецификация 003, AC-11).
    expect(screen.getByText('Билирубин общий')).toBeTruthy();
  });

  test('незнакомый показатель подписан так, как записан в файле', () => {
    storeLang('ru');

    render(<Table results={[result({code: undefined, name: 'Гомоцистеин плазмы'})]}/>);

    expect(screen.getByText('Гомоцистеин плазмы')).toBeTruthy();
  });

  test('дата анализа показана в языке интерфейса', () => {
    storeLang('ru');

    render(<Table results={[result()]}/>);

    expect(screen.getByText(/окт/i)).toBeTruthy();
  });
});

describe('нечисловое значение не выдаётся за «вне нормы»', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  const classesOf = (text: string) =>
    screen.getByText(text).closest('td')?.className ?? '';

  test('«следы» не красятся ни в хорошее, ни в плохое', () => {
    render(<Table results={[result({value: 'следы', normal: undefined})]}/>);

    expect(classesOf('следы')).not.toContain('bad');
    expect(classesOf('следы')).not.toContain('good');
  });

  test('значение в норме помечено как хорошее', () => {
    render(<Table results={[result({value: '8.04'})]}/>);

    expect(classesOf('8.04')).toContain('good');
  });

  test('значение вне нормы помечено как плохое', () => {
    render(<Table results={[result({value: '42'})]}/>);

    expect(classesOf('42')).toContain('bad');
  });
});

describe('предыдущее значение', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  test('показывается, когда единицы совпадают', () => {
    render(<Table results={[
      result({date: '2026-09-01', value: '9.04'}),
      result({date: '2026-10-21', value: '8.04'}),
    ]}/>);

    expect(screen.getByText('9.04')).toBeTruthy();
  });

  test('в других единицах не показывается', () => {
    render(<Table results={[
      result({date: '2026-09-01', value: '0.5', unit: 'мг/дл'}),
      result({date: '2026-10-21', value: '8.04', unit: 'мкмоль/л'}),
    ]}/>);

    expect(screen.queryByText('0.5')).toBeNull();
  });

  test('по показателю одна строка, а не по записи на каждую дату', () => {
    render(<Table results={[
      result({date: '2026-09-01', value: '9.04'}),
      result({date: '2026-10-21', value: '8.04'}),
    ]}/>);

    expect(document.querySelectorAll('tbody tr')).toHaveLength(1);
  });
});
